import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, TouchableWithoutFeedback, Keyboard } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useUser, useAuth } from '@clerk/clerk-expo';
import * as FileSystem from 'expo-file-system';
import supabaseClient from '../../utils/supabase';
import { debounce } from 'lodash';
import { Ionicons } from '@expo/vector-icons'; // Add this import at the top of your file
import { useRouter } from 'expo-router';

const DonationProof = () => {
    const [everyOrgUsername, setEveryOrgUsername] = useState('');
    const [image, setImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const [lastWager, setLastWager] = useState(null);
    const { user } = useUser();
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [verificationError, setVerificationError] = useState(false);
    const [everyOrgMessage, setEveryOrgMessage] = useState('');
    const nav = useRouter();
    const [relevantDonationFound, setRelevantDonationFound] = useState(false);

    const debouncedFetch = debounce((fetchFunction) => {
        fetchFunction();
      }, 300); // 300ms delay

    useEffect(() => {
        //get last failed wager
        let isSubscribed = true;
        const abortController = new AbortController();
        const fetchWager = async () => {
            try {
              console.log('fetching wager');
              const supabaseAccessToken = await getToken({ template: 'supabase' });
              const supabase = supabaseClient(supabaseAccessToken);
        
              const { data, error } = await supabase
                .from('wagers')
                .select()
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .abortSignal(abortController.signal);
        
              if (error) throw error;
        
              // If data is an array, get the first (and only) element
              const latestWager = data && data.length > 0 ? data[0] : null;
        
              if (isSubscribed && latestWager) {
                setLastWager(latestWager);
              } 
            } catch (error) {
              if (error.name !== 'AbortError') {
                console.error('An error occurred while fetching the wager:', error);
              }
            } finally {
              if (isSubscribed) setLoading(false);
            }
          };
        
          if (user) {
            debouncedFetch(fetchWager);
          }
        
          return () => {
            isSubscribed = false;
            abortController.abort();
          };
    }, []);

    const handleEveryOrgSubmit = async () => {
        try {
            setEveryOrgMessage('');
            const userResponse = await fetch(`https://api.www.every.org/api/public/users/${everyOrgUsername.toLowerCase()}`);
            const userData = await userResponse.json();
            
            if (userData.message === "Entity with this identifier not found") {
                setEveryOrgMessage('User not found');
                return;
            }

            const charity_search = await fetch(`https://partners.every.org/v0.2/nonprofit/${lastWager.charity_ein}?apiKey=${process.env.EVERY_ORG_API_KEY}`);
            const charity_data = await charity_search.json();
            console.log("charity_data", charity_data);

            const userId = userData.data.user.id;
            const feedResponse = await fetch(`https://api.www.every.org/api/public/users/${userId}/feed?take=20&skip=0`, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
              }
            });
            const feedData = await feedResponse.json();

            if (feedData.data.items.length === 0) {
                setEveryOrgMessage('No relevant donations found');
                return;
            }

            const relevantDonation = feedData.data.items.find(item => {
                const donationDate = new Date(item.donationCharge.donation.createdAt);
                return item.donationCharge.donation.toNonprofitId === charity_data.data.nonprofit.id && 
                       (donationDate.getTime() >= new Date(lastWager.last_date_completed).getTime());
            });

            setRelevantDonationFound(!!relevantDonation);
            setEveryOrgMessage(relevantDonation ? 'Donation found' : 'No relevant donations found');
        } catch (error) {
            console.error('Error submitting Every.org username:', error);
            setEveryOrgMessage('An error occurred. Please try again.');
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true, // Add this line to get base64 data
        });

        if (!result.canceled) {
        setImage(result.assets[0].uri);
        setIsProcessing(true);
        await processImage(result.assets[0].uri, result.assets[0].base64);
        }
    };

  const processImage = async (imageUri: string, base64Image: string | undefined) => {
    try {
      let base64Data = base64Image;
      if (!base64Data) {
        // If base64 is not available, read the file and convert it
        const fileContent = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        base64Data = fileContent;
      }

      // Prepare the request body for Google Cloud Vision API
      const body = JSON.stringify({
        requests: [
          {
            image: {
              content: base64Data,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
              },
            ],
          },
        ],
      });

      // TODO: Replace with your actual API endpoint and key
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: body,
        }
      );

      const data = await response.json();
      // Process the response data
      const hasRequiredInfo = checkRequiredInfo(data);
      setIsValid(hasRequiredInfo);
      setVerificationError(!hasRequiredInfo);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try again.');
      setVerificationError(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const checkRequiredInfo = (data) => {
    if (data.responses[0].fullTextAnnotation === undefined) {
      return false;
    }
    const text = data.responses[0].fullTextAnnotation.text.toLowerCase();
    console.log(text);
    // Check for required keywords in the text
    return (text.includes(user.firstName) || text.includes(user.lastName)) && text.includes(lastWager.amount) && (text.includes(lastWager.charity_name) || text.includes(lastWager.charity_ein));
  };

  const handleSubmit = async () => {
    try {
      setIsProcessing(true);
      const supabaseAccessToken = await getToken({ template: 'supabase' });
      const supabase = supabaseClient(supabaseAccessToken);

      const { data, error } = await supabase
        .from('wagers')
        .update({ donated: true })
        .eq('wager_id', lastWager.wager_id);

      if (error) throw error;

      // Handle successful update
      nav.back();
      // You might want to navigate to a different screen or update the UI here
    } catch (error) {
      console.error('Error updating wager:', error);
      alert('Failed to submit donation proof. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ backgroundColor: '#090909' }} className="flex-col w-full h-full space-y-6 items-center justify-center ">
        <Text className="text-2xl font-bold text-neutral-200">Submit Proof of Donation</Text>
        <View className="flex-col w-full h-fit items-center space-y-12">
            <View className="space-y-2 w-full items-center">
            <View className="flex-row w-5/6 h-fit items-start justify-start space-x-1 mb-3">
                <Text className='font-semibold text-neutral-300'>Option 1:</Text>
                <Text className="text-neutral-300">Sync Donations from Every.org</Text>

            </View>
            <View className="flex-row w-fit h-fit items-center justify-center space-x-2">
                <TextInput
                    className="bg-neutral-700 text-white p-2 rounded w-3/5 h-10"
                    value={everyOrgUsername}
                    onChangeText={setEveryOrgUsername}
                    placeholder="Every.org Username"
                    placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                    className="flex bg-neutral-200 rounded w-20 h-10 items-center justify-center"
                    onPress={handleEveryOrgSubmit}
                >
                    <Text className="text-neutral-900 text-center font-semibold">sync</Text>
                </TouchableOpacity>
            </View>
            {everyOrgMessage && (
                <View className="flex-row items-center space-x-2">
                    <Text className="text-neutral-500">
                        {everyOrgMessage}
                    </Text>
                    {everyOrgMessage === 'Donation found' ? (
                        <Ionicons name="checkmark-circle" size={24} color="green" />
                    ) : (
                        <Ionicons name="close-circle-outline" size={24} color="red" />
                    )}
                </View>
            )}
        </View>

        <View className="flex-col w-full h-fit items-center opacity-50">
            <View className="flex-row w-5/6 h-fit items-start justify-start mb-2">  
                <Text className="text-yellow-300 font-semibold">(In Alpha)*</Text>
            </View>
            <View className="flex-row w-full h-fit items-start justify-center space-x-1 mb-4">
                <Text className='font-semibold text-neutral-300'>Option 2:</Text>
                <Text className="text-neutral-300">Upload a photo of your donation receipt</Text>
            </View>
            <TouchableOpacity
                className="w-5/6 bg-neutral-200 p-2 rounded"
                disabled={true}
            >
                <Text className="text-neutral-900 text-center font-semibold">Select Image</Text>
            </TouchableOpacity>
        </View>
        <View className="flex-col w-5/6 h-24 pt-24 items-center justify-end">
            {(isValid || relevantDonationFound) && (
            <TouchableOpacity
                className="flex-row bg-green-500 h-12 rounded-3xl w-full items-center justify-center"
                onPress={handleSubmit}
            >
                <Text className="text-neutral-900 text-center font-semibold">Submit Donation Proof</Text>
            </TouchableOpacity>
            )}
        </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default DonationProof;
