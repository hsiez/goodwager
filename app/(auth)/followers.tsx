import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, ScrollView } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import supabaseClient from '../utils/supabase';
import { Shadow } from 'react-native-shadow-2';

// Define the Follower type
type Follower = {
  name: string;
  wager: boolean;
  today_status: string;
  profilePic: string;
  checkpoint: string | null;
  challengeDay: string | null;
};

// Define the FollowerCard component
const FollowerCard = ({follower}: {follower: Follower}) => {
  let buttonText = 'Send it!';
  const [statusColor, setStatusColor] = useState("#a1a1aa");

  useEffect(() => { 
    if(follower.today_status === 'workout detected') {
      setStatusColor("#71BC78");
    }

    if (follower.today_status === 'No workout detected') {
      buttonText = 'Get to work!';
    } else if (follower.today_status === 'Workout detected') {
      buttonText = 'Nice work!';
    }
  }, [follower.today_status]);

  return (
    <View className='flex h-20 w-full mb-4'>
        <Shadow startColor={'#050505'} paintInside={true} distance={3} style={{borderRadius: 8, flexDirection: "row", width: '100%', height:"100%" }}>
            <View style={{backgroundColor: "#0D0D0D"}} className="flex h-full rounded-lg w-full justify-center items-center">
                <View className='h-full w-full flex-row justify-between items-center'>
                    <View style={{backgroundColor: statusColor}} className='flex h-3/4 w-2 rounded-r' />
                    <View>
                        <Image source={{uri: follower.profilePic}} style={{width: 50, height: 50, borderRadius: 50}} />
                    </View>
                    <View>
                        <Text className="text-white">{follower.name}</Text>
                        <Text className="text-white">{follower.today_status}</Text>
                    </View>
                    <View>
                        <Button title={buttonText} onPress={() => {}} />
                    </View>
                </View>
            </View>
        </Shadow>
    </View>
  );
};

// Define the FollowersList component
const fakeFollowers: Follower[] = [
    {
        name: 'John Doe',
        wager: true,
        today_status: 'workout detected',
        profilePic: 'https://via.placeholder.com/150',
        checkpoint: '2',
        challengeDay: '13',
    },
    {
        name: 'Jane Doe',
        wager: true,
        today_status: 'no workout detected',
        profilePic: 'https://via.placeholder.com/150',
        checkpoint: '1',
        challengeDay: '4',
    },
    {
        name: 'Mac Miller',
        wager: false,
        today_status: 'no workout detected',
        profilePic: 'https://via.placeholder.com/150',
        checkpoint: null,
        challengeDay: null,
    },
    {
        name: 'Joey Doe',
        wager: true,
        today_status: 'no workout detected',
        profilePic: 'https://via.placeholder.com/150',
        checkpoint: "1",
        challengeDay: "7",
    },
]
const FollowersList = () => {
    const [followers, setFollowers] = useState<Follower[]>(fakeFollowers);
    const { getToken, userId } = useAuth();
    const [loading, setLoading] = useState(true);

    // Fetch the followers data
    useEffect(() => {
        let isSubscribed = true;
  
        const fetchWager = async () => {
            try {
            let supabaseAccessToken: string | null = null;
            try {
                supabaseAccessToken = await getToken({ template: 'supabase' });
            } catch (error) {
                console.error('Error fetching Supabase token:', error);
                supabaseAccessToken = null;
            }
            // Assuming supabaseClient is correctly initialized and can accept the token.
            
            const supabase = supabaseClient(supabaseAccessToken);


            let { data, error } = await supabase
                .from('followers')
                .select()
                .eq('follower', userId);

            if (error) {
                console.log('error fetching from supabase', error);
                throw error;
            }
            
            if (isSubscribed) {
                if (data.length > 0) {
                setFollowers(data);

                }
                setLoading(false);
            }
            } catch (error) {
            console.error('An error occurred while fetching the wager:', error as string);
            if (isSubscribed) {
                setLoading(false);
            }
            // Handle error state as needed, e.g. show a message to the user
            }
        };

        if (userId) {
            fetchWager();
        }

        return () => {
            isSubscribed = false; // Clean up subscription on unmount
        };
        }, [userId]);

    return (
        <View style={{backgroundColor: "#080808"}} className="flex-col h-full items-center">
            <View>
                <Text className="text-2xl">Followers</Text>
            </View>
            <ScrollView contentContainerStyle={{height: "100%", width: "95%", paddingHorizontal: 6}}>
                {followers.map((follower) => (
                <FollowerCard key={follower.name} follower={follower} />
                ))}
            </ScrollView>
        </View>
    );
};

export default FollowersList;

// Fetch the followers data and render the FollowersList component
// This part should be in your main component where you use the FollowersList
// const followersData = fetchFollowersData();
// <FollowersList followers={followersData} />