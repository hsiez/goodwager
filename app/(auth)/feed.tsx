import React, { useState, useEffect } from 'react';
import { View, Text, Image, ImageBackground, ScrollView, Pressable } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import supabaseClient from '../utils/supabase';
import { Shadow } from 'react-native-shadow-2';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { fetchUserFromUsername, fetchFollowerWagerData } from '../utils/clerk_apis';
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import { useIsFocused } from '@react-navigation/native';



const CARD_IMAGES = {
    green: require("../assets/images/feed_green_2.png"),
    red: require("../assets/images/feed_red.png"),
  };


// Define the FollowerCard component
const FollowerCard = ({follower}: {follower}) => {
    const { userId, getToken } = useAuth();
    const {user} = useUser();
    const [followerData, setFollowerData] = useState(null);
    const [followerWagerData, setFollowerWagerData] = useState({amount: 0, workout_freq: 0, end_date: new Date().toISOString(), streak: 0});
    const [buttonPressed, setButtonPressed] = useState(false);
    const [notificationId, setNotificationId] = useState(null);
    const [worked_out_today, setWorkedOutToday] = useState(follower.worked_out_today);

    // Determine initial button text, status color, and status text based on follower's workout_today property
    const initialButtonText = worked_out_today ? "LFG!" : "Get Up!";
    const initialStatusColor = worked_out_today ? "#71BC78" : "rgb(244 63 94)";
    const initialStatusText = worked_out_today ? "Exercised Today" : "Exercise Pending";

    const [buttonText, setButtonText] = useState(initialButtonText);
    const [statusColor, setStatusColor] = useState(initialStatusColor);
    const [statusText, setStatusText] = useState(initialStatusText);
    const [card_text, setCardText] = useState("Today's Workout is Pending");
    const notButtonColorDefault = "#fff";

    const getColorAfterPress = () => {
        switch (statusText) {
            case "Exercised Today":
                return "#00ff00";
            case "Exercise Pending":
                return "rgb(251 113 133)"

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
                { sender: userId, sender_un: user.username, receiver: follower.followee, receiver_status: statusText, created_at: today }
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
                .eq('receiver', follower.followee);
            if (error) {
                console.log('error fetching notification data from supabase', error);
                throw error;
            }
            
            if (data.length > 0) {
                setButtonPressed(data.length > 0);
                switch (data[0].receiver_status) {
                    case 'Exercised Today':
                    setButtonText("Sent!");
                    setStatusColor("#71BC78");
                    setStatusText("Exercised Today");
                    setNotificationId(data[0].id);
                    break;
                    case 'Excercise Pending':
                    setButtonText("Sent!");
                    setStatusColor("rgb(244 63 94)");
                    setStatusText("Exercise Pending");
                    setNotificationId(data[0].id);
                    break;
                }
            }

        }
        async function fetchFollowerData() {
            const data = await fetchUserFromUsername(follower.followee_un, await getToken({ template: 'supabase' }));
            setFollowerData(data[0]);
            const wagerData = await fetchFollowerWagerData(follower.followee, await getToken({ template: 'supabase' }));
            if (wagerData.amount > 0) {
                const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
                setFollowerWagerData(wagerData);
                setWorkedOutToday(wagerData.last_date_completed === today);
                setCardText(wagerData.last_date_completed === today ? "Today's Workout is Complete!" : "Today's Workout is Pending");
            }
            
        }
        fetchNotData();
        fetchFollowerData();
        if (!notificationId) {
            setButtonText(worked_out_today ? "LFG!" : "Get Up!");
            setStatusColor(worked_out_today ? "#71BC78" : "rgb(244 63 94)");
            setStatusText(worked_out_today ? "Exercised Today" : "Exercise Pending");
        }
    }, [follower]);

    if (!followerData) {
        return null;
    }

    if (followerWagerData.amount === 0) {
        return null;
    }

    const cardKey = worked_out_today ? "green" : "red";
    const cardImage = CARD_IMAGES[cardKey];
    return (
        <View className='flex-1 h-36 w-full mb-4'>
            <Shadow startColor={'#050505'} distance={6} style={{borderRadius: 12, flexDirection: "row", width: '100%', height:"100%" }}>
                <View className="flex-1 h-full w-full">
                    <ImageBackground source={cardImage} resizeMode='stretch' style={{backgroundColor: "#0D0D0D", borderRadius: 10, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', flex: 1}}>
                        <View className='flex-row w-full justify-between items-start'>
                            <View className='flex-row w-fit justify-start px-2 py-3 mb-2'>
                                <View className='flex-row w-fit h-fit space-x-2 items-center'>
                                    <View className='flex h-11 w-11 rounded-full p-0.5 border border-neutral-600 justify-center items-center'>
                                        <Image source={{uri: followerData.image_url}} style={{width: 40, height: 40, borderRadius: 50}} />
                                    </View>
                                    <View className='flex-col justify-center items-start w-fit'>
                                        <Text className="text-lg text-neutral-300">{followerData.first_name} {followerData.last_name}</Text>
                                        <View className='flex-row w-fit justify-start space-x-1'>
                                            <View className='flex-row w-fit justify-start items-center'>
                                                <Text style={{fontSize: 8}} className="text-xs text-neutral-300">${followerWagerData.amount}</Text>
                                            </View>
                                            <Text style={{fontSize:12, fontWeight: "bold"}} className='text-neutral-600'>|</Text>
                                            <View className='flex-row w-fit items-center'>
                                                <Text style={{fontSize: 8}} className="text-xs text-neutral-300">{followerWagerData.workout_freq} workouts</Text>
                                            </View>
                                            <Text style={{fontSize: 12, fontWeight: "bold"}} className='text-neutral-600'>|</Text>
                                            <View className='flex-row w-fit justify-start items-center'>
                                                <FontAwesome6 name="flag-checkered" size={7} color={' rgb(31 41 55)'} />
                                                <Text style={{fontSize: 8}} className="text-xs text-neutral-300"> {new Date(followerWagerData.end_date).toLocaleDateString()}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View className="flex-row h-fit w-fit pt-4 pr-3 space-x-0.5 justify-start items-start">
                                <View className="h-fit w-3 rounded border border-neutral-600  px-0.5">
                                    <Text style={{fontSize:8}} className="text-neutral-400 text-center text-xs font-bold">{Math.floor(followerWagerData.streak / 10)}</Text>
                                </View>
                                <View className="h-fit w-3 rounded border border-neutral-600 px-0.5">
                                    <Text style={{fontSize:8}} className="text-neutral-400 text-center text-xs font-bold">{followerWagerData.streak % 10}</Text>
                                </View>
                            </View>
                        </View>
                        <View className="flex-row w-full h-fit justify-center items-center">
                            <View className='flex-row w-full justify-center'>
                                <View className="flex items-center justify-center">
                                    <Text className="text-neutral-300 text-md font-bold">{card_text}</Text>
                                </View>
                            </View>
                        </View>
                        <View className='flex-col h-fit w-full space-y-1 items-end justify-start pr-3 pt-2'>
                            <Shadow startColor={'#050505'} distance={2} style={{borderRadius: 10}}>
                                <Pressable onPress={handlePress} disabled={buttonPressed}>
                                <View style={{borderColor: buttonPressed ? getColorAfterPress() : notButtonColorDefault}} className='flex justify-center items-center h-8 w-8 border rounded-lg'>
                                        <Svg height="100%" width="100%" >
                                            <Defs>
                                                <RadialGradient id="grad" cx="50%" cy="50%" r="100%" fx="50%" fy="50%">
                                                    <Stop offset="34%" stopColor="#0D0D0D" stopOpacity="1" />
                                                    <Stop offset="100%" stopColor={buttonPressed ? getColorAfterPress() : notButtonColorDefault} stopOpacity="1" />
                                                </RadialGradient>
                                            
                                            </Defs>
                                            <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" rx={7} ry={7}/>
                                            <View className="flex h-full w-full justify-center items-center">
                                                <Icon status={statusText} />
                                            </View>
                                        </Svg>
                                        
                                    
                                </View>
                                </Pressable>
                            </Shadow>
                        </View>
                    </ImageBackground>
                </View>
            </Shadow>
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
                setFollowers(data);                }
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
        <View style={{backgroundColor: "#090909"}} className="flex-col h-full justify-center items-center pt-5">
            <View className=" flex-col px-1 w-full h-full justify-center items-center space-y-1 mt-20">
                {/* screen title */}
                <View className='flex w-full items-start px-2'>
                    <Text style={{fontSize: 12}} className="text-neutral-200 font-bold">Active Wagers</Text>
                </View>
                <View style={{height:"95%"}} className='flex-row w-full'>
                    <ScrollView 
                        showsVerticalScrollIndicator={false} 
                        contentContainerStyle={{alignItems: 'center', paddingBottom:5}} 
                        className='pb-0.5 py-1 w-full border-t-2  border-neutral-800 rounded-xs'
                        style={{minWidth: '100%', height:"100%", paddingHorizontal: 6}} // Set a minimum width to maintain full size
                    >
                        
                        {followers.map((follower) => (
                        <FollowerCard key={follower.followee_un} follower={follower} />
                        ))}
                    </ScrollView>
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