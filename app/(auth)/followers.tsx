import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, ScrollView, Pressable } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import supabaseClient from '../utils/supabase';
import { Shadow } from 'react-native-shadow-2';

// Define the Follower type
type Follower = {
  name: string;
  wager: boolean;
  workout_today: boolean;
  profilePic: string;
  checkpoint: string | null;
  challengeDay: string | null;
};

// Define the FollowerCard component
const FollowerCard = ({follower}: {follower: Follower}) => {
    const [buttonText, setButtonText] = useState('Get Up!');
    const [statusColor, setStatusColor] = useState("rgb(244 63 94)");
    const [statusText, setStatusText] = useState("Exercise Pending");

    useEffect(() => {
        if (!follower.wager){
            setStatusColor("#a1a1aa");
            setButtonText('Ante Up!');
            setStatusText('No Active Wager');
            return;
        }
        if(follower.workout_today === true) {
            setStatusColor("#71BC78");
            setStatusText("Exercised Today");
            setButtonText("LFG");
        }
    }, [follower.workout_today]);

    return (
        <View className='flex h-20 w-full mb-4'>
            <Shadow startColor={'#050505'} paintInside={true} distance={3} style={{borderRadius: 8, flexDirection: "row", width: '100%', height:"100%" }}>
                <View style={{backgroundColor: "#0D0D0D"}} className="flex-col h-full rounded-lg w-full justify-between items-center px-2">
                    <View className='h-full w-full flex-row justify-between items-between'>
                        <View className='h-full justify-center items-center'>
                            <Image source={{uri: follower.profilePic}} style={{width: 50, height: 50, borderRadius: 50, borderColor: statusColor, borderWidth: 2}} />
                        </View>
                        <View className='flex-col justify-center items-start w-1/3'>
                            <Text className="text-lg text-neutral-200">{follower.name}</Text>
                            <Text className="text-xs text-neutral-600">{statusText}</Text>
                        </View>
                        <View className='flex justify-center items-center h-full w-20'>
                            <Shadow startColor={'#050505'} paintInside={true} distance={2} style={{borderRadius: 8, flexDirection: "row", width: '100%'}}>
                                <View style={{backgroundColor: "#0D0D0D"}} className="flex h-6 border border-neutral-400 bg-neutral-700 rounded-lg w-full justify-center items-center">
                                    <View className='h-full w-full flex-col justify-between items-center'>
                                        <Pressable className='flex items-center justify-center'>
                                            <Text className='text-white text-sm text-center'>{buttonText} </Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </Shadow>
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
        workout_today: true,
        profilePic: 'https://via.placeholder.com/150',
        checkpoint: '2',
        challengeDay: '13',
    },
    {
        name: 'Janet Doe',
        wager: true,
        workout_today: false,
        profilePic: 'https://via.placeholder.com/150',
        checkpoint: '1',
        challengeDay: '4',
    },
    {
        name: 'Mac Miller',
        wager: false,
        workout_today: true,
        profilePic: 'https://via.placeholder.com/150',
        checkpoint: null,
        challengeDay: null,
    },
    {
        name: 'Patrick Tumbucom',
        wager: true,
        workout_today: false,
        profilePic: 'https://via.placeholder.com/150',
        checkpoint: "1",
        challengeDay: "7",
    },
    {
        name: 'John Pham',
        wager: true,
        workout_today: true,
        profilePic: 'https://via.placeholder.com/150',
        checkpoint: '2',
        challengeDay: '13',
    },
    {
        name: 'Benny Pham',
        wager: true,
        workout_today: false,
        profilePic: 'https://via.placeholder.com/150',
        checkpoint: '1',
        challengeDay: '4',
    },
    {
        name: 'Jacob JOhnson',
        wager: false,
        workout_today: true,
        profilePic: 'https://via.placeholder.com/150',
        checkpoint: null,
        challengeDay: null,
    },
    {
        name: 'Action Bronson',
        wager: true,
        workout_today: false,
        profilePic: 'https://via.placeholder.com/150',
        checkpoint: "1",
        challengeDay: "7",
    },
    {
        name: 'Uncle Iroh',
        wager: true,
        workout_today: true,
        profilePic: 'https://via.placeholder.com/150',
        checkpoint: '2',
        challengeDay: '13',
    },
    {
        name: 'Kobe Bryant',
        wager: true,
        workout_today: false,
        profilePic: 'https://via.placeholder.com/150',
        checkpoint: '1',
        challengeDay: '4',
    },
    {
        name: 'John Wislon',
        wager: false,
        workout_today: true,
        profilePic: 'https://via.placeholder.com/150',
        checkpoint: null,
        challengeDay: null,
    },
    {
        name: 'Ken Watanabe',
        wager: true,
        workout_today: false,
        profilePic: 'https://via.placeholder.com/150',
        checkpoint: "1",
        challengeDay: "7",
    }
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
        <View style={{backgroundColor: "#090909"}} className="flex-col h-full items-center">
            <View className="mt-10 mb-3 pl-2 w-full h-auto">
                <Text className="text-2xl text-neutral-200">Motivate Your Friends</Text>
            </View>
            <ScrollView contentContainerStyle={{height: "80%", width: "95%", paddingHorizontal: 6}}>
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