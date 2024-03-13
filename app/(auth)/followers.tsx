import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, ScrollView, Pressable } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import supabaseClient from '../utils/supabase';
import { Shadow } from 'react-native-shadow-2';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
//import * as Toast from 'expo-toast';
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
    const { userId, getToken } = useAuth();
    const [buttonPressed, setButtonPressed] = useState(false);
    const [notificationId, setNotificationId] = useState(null);

    // Determine initial button text, status color, and status text based on follower's workout_today property
    const initialButtonText = follower.workout_today ? "LFG!" : "Get Up!";
    const initialStatusColor = follower.workout_today ? "#71BC78" : "rgb(244 63 94)";
    const initialStatusText = follower.workout_today ? "Exercised Today" : "Exercise Pending";

    const [buttonText, setButtonText] = useState(initialButtonText);
    const [statusColor, setStatusColor] = useState(initialStatusColor);
    const [statusText, setStatusText] = useState(initialStatusText);
    const notButtonColorDefault = "#fff";

    const getColorAfterPress = () => {
        switch (statusText) {
            case "Exercised Today":
                return "#00ff00";
            default:
                return "rgb(251 113 133)";
        }
    };

    async function storeStateNotification() {
        const supabase = supabaseClient(await getToken({ template: 'supabase' }));
        const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
        const { error } = await supabase
            .from('notifications')
            .insert(
                { sender: userId, receiver: follower.name, receiver_status: statusText, created_at: today }
            );
        if (error) {
            console.log('error storing notification: supabase', error);
            throw error;
        }
    }
    const handlePress = () => {
        setButtonPressed(!buttonPressed);
        storeStateNotification();
        setButtonText("Sent!");
        // Store this notification instance in the database
        
        // Implement the functionality to send a notification here
    };


    const Icon = ({status}: {status: string}) => {
        if (status === 'No Active Wager') {
            return (
                <Ionicons name="wallet-outline" size={20} color={buttonPressed ? getColorAfterPress() : notButtonColorDefault} />
            )
        }
        if (status === 'Exercised Today') {
            return (
                <Ionicons name="sparkles-outline" size={20} color={buttonPressed ? getColorAfterPress() : notButtonColorDefault} />
            )
        }
        return (
            <Ionicons name="barbell-outline" size={20} color={buttonPressed ? getColorAfterPress() : notButtonColorDefault} />
        )
    }

    useEffect(() => {
        async function fetchNotData() {
            const supabase = supabaseClient(await getToken({ template: 'supabase' }));
            const { data, error } = await supabase
                .from('notifications')
                .select()
                .eq('sender', userId)
                .eq('receiver', follower.name);
            if (error) {
                console.log('error fetching notification data from supabase', error);
                throw error;
            }
            if (data.length > 0) {
                if (data[0].receiver_status === 'Exercised Today') {
                    setButtonText("Sent!");
                    setStatusColor("#71BC78");
                    setStatusText("Exercised Today");
                }

                if (data[0].receiver_status === 'Excercise Pending') {
                    setButtonText("Sent!");
                    setStatusColor("rgb(244 63 94)");
                    setStatusText("Exercise Pending");
                }
                setButtonPressed(true);
                setNotificationId(data[0].id);
            }

        }
        fetchNotData();
        setButtonText(follower.workout_today ? "LFG!" : "Get Up!");
        setStatusColor(follower.workout_today ? "#71BC78" : "rgb(244 63 94)");
        setStatusText(follower.workout_today ? "Exercised Today" : "Exercise Pending");
    }, [follower.workout_today]);


    return (
        <View className='flex h-20 w-full mb-4'>
            <Pressable onPress={handlePress} disabled={buttonPressed} >
            <Shadow startColor={'#050505'} paintInside={true} distance={3} style={{borderRadius: 12, flexDirection: "row", width: '100%', height:"100%" }}>
                <View style={{backgroundColor: "#0D0D0D"}} className="flex-col h-full  w-full justify-between items-center border-neutral-800 rounded-xl border px-2">
                    <View className='h-full w-full flex-row justify-between items-center'>
                        <View className='h-full justify-center items-center'>
                            <Image source={{uri: follower.profilePic}} style={{width: 40, height: 40, borderRadius: 50}} />
                        </View>
                        <View className='flex-col justify-center items-start w-1/3'>
                            <Text className="text-lg text-neutral-200">{follower.name}</Text>
                            <Text className="text-xs text-neutral-600">{statusText}</Text>
                        </View>
                        <View className='flex-col h-fit w-fit space-y-1'>
                        <Shadow startColor={'#050505'} distance={2} style={{borderRadius: 8}}>
                            <View style={{borderColor: buttonPressed ? getColorAfterPress() : notButtonColorDefault}} className='flex justify-center items-center h-10 w-10 border  rounded-xl'>
                                
                                    <Svg height="100%" width="100%" >
                                        <Defs>
                                            <RadialGradient id="grad" cx="50%" cy="50%" r="100%" fx="50%" fy="50%">
                                                <Stop offset="40%" stopColor="#0D0D0D" stopOpacity="1" />
                                                <Stop offset="100%" stopColor={buttonPressed ? getColorAfterPress() : notButtonColorDefault} stopOpacity="1" />
                                            </RadialGradient>
                                        
                                        </Defs>
                                        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" rx={11} ry={11}/>
                                        <View className="flex h-full w-full justify-center items-center ">
                                            <Icon status={statusText} />
                                        </View>
                                    </Svg>
                                    
                                
                            </View>
                            </Shadow>
                            <View className='flex w-full items-center'>
                                <Text style={{fontSize: 8}} className="text-white font-semibold">{buttonText} </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Shadow>
            </Pressable>
        </View>
    );
};

// Define the FollowersList component
const fakeFollowers: Follower[] = [
    {
        name: 'Benny Pham',
        wager: true,
        workout_today: true,
        profilePic: 'https://via.placeholder.com/150',
        checkpoint: '2',
        challengeDay: '13',
    },
    {
        name: 'John Pham',
        wager: true,
        workout_today: false,
        profilePic: 'https://via.placeholder.com/150',
        checkpoint: '1',
        challengeDay: '4',
    },
    {
        name: 'Patrick Tumbucom',
        wager: false,
        workout_today: true,
        profilePic: 'https://via.placeholder.com/150',
        checkpoint: null,
        challengeDay: null,
    },
    {
        name: 'Jacob Johnson',
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
                console.log('error fetching followers list from supabase', error);
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
        <View style={{backgroundColor: "#090909"}} className="flex-col h-full items-center pt-10">
            <View className=" flex-row mt-10 mb-3 px-4 w-full justify-between h-auto items-center">
                <Text style={{fontSize: 12}} className="text-white font-semibold">Motivate Your Friends</Text>
                {/* button to open invite module */}
                <Pressable className='flex-row px-4 py-1 border border-neutral-800 rounded-xl justify-center items-center'>
                    <Text style={{fontSize: 10}} className="text-white font-semibold">Invite</Text>
                </Pressable>
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