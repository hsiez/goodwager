import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Pressable } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import supabaseClient from '../utils/supabase';
import { Shadow } from 'react-native-shadow-2';
import { Ionicons } from '@expo/vector-icons';
import fetchUsername from '../utils/get_usersnames';
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import { useIsFocused } from '@react-navigation/native';


// Define the FollowerCard component
const FollowerCard = ({follower}: {follower}) => {
    const { userId, getToken } = useAuth();
    const [followerData, setFollowerData] = useState(null);
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
        async function fetchFollowerData() {
            const data = await fetchUsername(follower.followee_un, await getToken({ template: 'supabase' }));
            setFollowerData(data[0]);
            
        }
        fetchNotData();
        fetchFollowerData();
        setButtonText(follower.workout_today ? "LFG!" : "Get Up!");
        setStatusColor(follower.workout_today ? "#71BC78" : "rgb(244 63 94)");
        setStatusText(follower.workout_today ? "Exercised Today" : "Exercise Pending");
    }, [follower]);

    if (!followerData) {
        return null;
    }
    return (
        <View className='flex h-20 w-full mb-2'>
            <Pressable onPress={handlePress} disabled={buttonPressed} >
            <Shadow startColor={'#050505'} paintInside={true} distance={3} style={{borderRadius: 12, flexDirection: "row", width: '100%', height:"100%" }}>
                <View style={{backgroundColor: "#0D0D0D"}} className="flex-col h-full  w-full justify-between items-center border-neutral-800 rounded-xl border px-2">
                    <View className='h-full w-full flex-row justify-between items-center'>
                        <View className='flex h-11 w-11 rounded-full p-0.5 border border-neutral-400 justify-center items-center'>
                            <Image source={{uri: followerData.image_url}} style={{width: 40, height: 40, borderRadius: 50}} />
                        </View>
                        <View className='flex-col justify-center items-start w-1/3'>
                            <Text className="text-lg text-neutral-200">{followerData.first_name} {followerData.last_name}</Text>
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

const FollowersList = () => {
    const isFocused = useIsFocused();
    const [followers, setFollowers] = useState([]);
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
                console.log(data);
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
        }, [userId, isFocused]);

    return (
        <View style={{backgroundColor: "#090909"}} className="flex-col h-full justify-center items-center pt-10">
            <View className=" flex-col px-3 w-full h-full justify-center items-center space-y-2">
                <View className='flex-row w-full ml-2 justify-start'>
                    <Text style={{fontSize: 12}} className="text-white font-semibold">Motivate Your Friends</Text>
                </View>
                {/* button to open invite module */}
                <View style={{height:"80%"}} className='flex-row w-full'>
                    <Shadow startColor={'#050505'} distance={2}>
                    <ScrollView 
                        showsVerticalScrollIndicator={false} 
                        contentContainerStyle={{alignItems: 'center', paddingBottom:5}} 
                        className=' pb-0.5 px-1 py-1 w-full border rounded-xl border-neutral-800'
                        style={{minWidth: '100%', height:"100%"}} // Set a minimum width to maintain full size
                    >
                        
                        {followers.map((follower) => (
                        <FollowerCard key={follower.followee_un} follower={follower} />
                        ))}
                    </ScrollView>
                    </Shadow>
                </View>
            </View>
        </View>
    );
};

export default FollowersList;

// Fetch the followers data and render the FollowersList component
// This part should be in your main component where you use the FollowersList
// const followersData = fetchFollowersData();
// <FollowersList followers={followersData} />