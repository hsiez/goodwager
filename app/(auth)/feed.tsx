import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import supabaseClient from '../utils/supabase';
import { Shadow } from 'react-native-shadow-2';
import { Ionicons, FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import { fetchUserFromUsername, fetchFollowerWagerData } from '../utils/clerk_apis';
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";
import { useIsFocused } from '@react-navigation/native';
import {Reaction} from 'react-native-reactions';

// Define the FollowerCard component
const FollowerCard = ({follower}: {follower}) => {
    const { userId, getToken } = useAuth();
    const {user} = useUser();
    const [followerData, setFollowerData] = useState(null);
    const [followerWagerData, setFollowerWagerData] = useState({amount: 0, end_date: null, start_date: null, status: '', last_date_completed: null});
    const [buttonPressed, setButtonPressed] = useState(false);
    const [notificationId, setNotificationId] = useState(null);
    const [worked_out_today, setWorkedOutToday] = useState(false);

    // Determine initial button text, status color, and status text based on follower's workout_today property
    const initialButtonText = worked_out_today ? "LFG!" : "Get Up!";
    const initialStatusColor = worked_out_today ? "#71BC78" : "rgb(244 63 94)";
    const initialStatusText = worked_out_today ? "Exercised Today" : "Exercise Pending";

    const [buttonText, setButtonText] = useState(initialButtonText);
    const [statusColor, setStatusColor] = useState(initialStatusColor);
    const [statusText, setStatusText] = useState(initialStatusText);
    const [card_text, setCardText] = useState("Today's Workout is Pending");
    const notButtonColorDefault = "#a3a3a3";

    // Set initial wager status text and color based on follower's wager status
    const [wagerStatusColor, setWagerStatusColor] = useState("#d4d4d4");

    // Set initial workout status text and color based on follower's workout status
    const [workoutStatusText, setWorkoutStatusText] = useState("Pending");
    const [workoutStatusColor, setWorkoutStatusColor] = useState("#d4d4d4");

    // Set initial selected emoji
    const [selectedEmoji, setSelectedEmoji] = useState<EmojiItemProp>();

    // Effect for fetching follower data
    useEffect(() => {
        const fetchFollowerData = async () => {
            try {
                const token = await getToken({ template: 'supabase' });
                const userData = await fetchUserFromUsername(follower.followee_un, token);
                setFollowerData(userData[0]);
            } catch (error) {
                console.error('Error fetching follower data:', error);
            }
        };

        fetchFollowerData();
    }, [follower.followee_un, getToken]);

    // Effect for fetching notification data
    useEffect(() => {
        const fetchNotificationData = async () => {
            try {
                const supabase = supabaseClient(await getToken({ template: 'supabase' }));
                const { data, error } = await supabase
                    .from('notifications')
                    .select()
                    .eq('sender', userId)
                    .eq('receiver', follower.followee);
    
                if (error) throw error;
                
                if (data.length > 0) {
                    setButtonPressed(true);
                    updateUIBasedOnNotification(data[0]);
                    setNotificationId(data[0].id);
                    setSelectedEmoji(ReactionItems.find(item => item.emoji === data[0].reaction));
                }
            } catch (error) {
                console.error('Error fetching notification data:', error);
            }
        };
    
        fetchNotificationData();
    }, [follower.followee, userId, getToken]);

    // Effect for fetching wager data
    useEffect(() => {
        const fetchWagerData = async () => {
            try {
                const token = await getToken({ template: 'supabase' });
                const wagerData = await fetchFollowerWagerData(follower.followee, token);
                if (wagerData.amount > 0) {
                    updateUIBasedOnWagerData(wagerData);
                }
            } catch (error) {
                console.error('Error fetching wager data:', error);
            }
        };

        fetchWagerData();
    }, [follower.followee, getToken, followerWagerData]);

    const updateUIBasedOnNotification = (notification) => {
        switch (notification.receiver_status) {
            case 'Exercised Today':
                setButtonText("Sent!");
                setStatusColor("#71BC78");
                setStatusText("Exercised Today");
                setNotificationId(notification.id);
                break;
            case 'Exercise Pending':
                setButtonText("Sent!");
                setStatusColor("rgb(244 63 94)");
                setStatusText("Exercise Pending");
                setNotificationId(notification.id);
                break;
        }
    };

    const updateUIBasedOnWagerData = (wagerData) => {
        const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
        setFollowerWagerData(wagerData);
        const workoutCompleted = wagerData.last_date_completed === today;
        setWorkedOutToday(workoutCompleted);
        setCardText(workoutCompleted ? "Today's Workout is Complete!" : "Today's Workout is Pending");

        // Set workout status text and color based on whether the workout was completed today
        switch (wagerData.last_date_completed === today) {
            case true:
                setWorkoutStatusText("Completed");
                setWorkoutStatusColor("#00ff00");
                break;
            case false:
                setWorkoutStatusText("Pending");
                setWorkoutStatusColor("#facc15");
                break;
        }

        // Set wager status color based on the wager's status
        switch (followerWagerData.status) {
            case 'ongoing':
                setWagerStatusColor("#00ff00");
                break;
            case 'failed':
                setWagerStatusColor("#dc2626");
                break;
            case 'completed':
                setWagerStatusColor("#6366f1");
                break;
        }



        if (!notificationId) {
            setButtonText(workoutCompleted ? "LFG!" : "Get Up!");
            setStatusColor(workoutCompleted ? "#71BC78" : "rgb(244 63 94)");
            setStatusText(workoutCompleted ? "Exercised Today" : "Exercise Pending");
        }
    };

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
    

    async function storeOrUpdateNotification(reaction: React.ReactNode | string | number) {
        const supabase = supabaseClient(await getToken({ template: 'supabase' }));
        const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
    
        if (notificationId) {
            // Update existing notification
            const { error } = await supabase
                .from('notifications')
                .update({ reaction: reaction })
                .eq('id', notificationId);
            if (error) {
                console.log('error updating notification: supabase', error);
                throw error;
            }
        } else {
            // Create new notification
            console.log("Creating new notification", reaction);
            const { data, error } = await supabase
                .from('notifications')
                .insert(
                    { sender: userId, sender_un: user.username, receiver: follower.followee, created_at: today, reaction: reaction }
                )
                .select();
            if (error) {
                console.log('error storing notification: supabase', error);
                throw error;
            }
            if (data && data.length > 0) {
                setNotificationId(data[0].id);
            }
        }
    }

    const handlePress = () => {
        setButtonPressed(!buttonPressed);
        setButtonText("Sent!");
        // Store this notification instance in the database
        
        // Implement the functionality to send a notification here
    };

    interface EmojiItemProp {
        id: number;
        emoji: React.ReactNode | string | number;
        title: string;
      }

    const ReactionItems = [
        {
          id: 0,
          emoji: '👍',
          title: 'like',
        },
        {
          id: 1,
          emoji: '🔥',
          title: 'fire',
        },
        {
          id: 2,
          emoji: '👏',
          title: 'lets go!',
        },
        {
          id: 3,
          emoji: '👎',
          title: 'Not it',
        },
        {
          id: 4,
          emoji: '🫵',
          title: 'Get to it',
        },
        {
          id: 5,
          emoji: '‼️',
          title: 'Do it!',
        },
      ];
    

    if (!followerData) {
        return null;
    }

    if (followerWagerData.amount === 0) {
        return null;
    }
    return (
        <View className='flex-1 h-36 w-full mb-4'>
            <Shadow startColor={'#050505'} distance={4} style={{borderRadius: 12, flexDirection: "row", width: '100%', height:"100%" }}>
                <View className="flex-col h-full w-full">
                    <View className="flex-row w-full h-fit justify-start items-center pl-3">
                        <View style={{backgroundColor: wagerStatusColor}} className="flex w-fit h-fit px-4 justify-center items-center rounded-t-lg">
                            <Text style={{ fontSize: 12 }} className="text-neutral-900 font-semibold">{followerWagerData.status}</Text>
                        </View>
                    </View>
                    <View className="flex-1 w-full bg-neutral-900 rounded-2xl border border-neutral-600">
                        <View className='flex-row w-full justify-between items-start '>
                            <View className='flex-row w-fit justify-start px-2 py-3 mb-2'>
                                <View className='flex-row w-fit h-fit space-x-2 items-center'>
                                    <View className='flex h-fit w-fit p-0.5 rounded-full border border-neutral-400 justify-center items-center'>
                                        <Image source={{uri: followerData.image_url}} style={{width: 40, height: 40, borderRadius: 50}} />
                                    </View>
                                    <View className='flex-col justify-center items-start w-fit'>
                                        <Text className="text-lg text-neutral-300">{followerData.first_name} {followerData.last_name}</Text>
                                        <View className='flex-row w-fit justify-start space-x-1'>
                                            <View className='flex-row px-2 justify-center items-center bg-neutral-700 rounded-3xl'>
                                                <Text style={{fontSize: 10}} className="text-xs text-neutral-300">${followerWagerData.amount}</Text>
                                            </View>
                                            <View className='flex-row px-2 space-x-1 justify-center items-center bg-neutral-700 rounded-3xl'>
                                                <FontAwesome6 name="flag-checkered" size={10} color={'#e5e5e5'} />
                                                <Text style={{fontSize: 10}} className="text-xs text-neutral-300"> {new Date(followerWagerData.end_date).toLocaleDateString()}</Text>
                                            </View>
                                            {
                                            followerWagerData.status === 'ongoing' && (
                                                <View style={{backgroundColor: workoutStatusColor}} className='flex-row px-2 space-x-1 justify-center items-center rounded-3xl'>
                                                    <Ionicons name="barbell-outline" size={10} color={'#e5e5e5'} />
                                                    <Text style={{fontSize: 10}} className="text-xs text-neutral-900"> {workoutStatusText}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={{position: 'absolute', bottom: 10, right: 10, zIndex: 0}}>
                        <Reaction
                            items={ReactionItems}
                            onTap={(item) => {
                                setSelectedEmoji(item);
                                console.log("Selected emoji:", item.emoji);
                                storeOrUpdateNotification(item.emoji);
                                // Add more logic here if needed
                            }}
                            showPopupType="onPress"
                            cardStyle={{backgroundColor: '#404040', shadowOffset: {width: 0, height: 0}}}
                            iconSize={20}
                        >   
                            <View className='p-2 rounded-full item-center justify-center border border-neutral-800'>
                                {selectedEmoji ? (
                                    <Text style={{color: '#fff', fontSize: 25}}>{selectedEmoji.emoji}</Text>
                                    ) : (
                                    <MaterialIcons name="add-reaction" size={25} color="black" />
                                )}
                            </View>
                                
                        </Reaction>
                    </View>
                    </View>
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
                    <Text style={{fontSize: 12}} className="text-neutral-200 font-bold">Motivate your Friends</Text>
                </View>
                <View style={{height:"95%"}} className='flex-row w-full'>
                    <ScrollView 
                        showsVerticalScrollIndicator={false} 
                        contentContainerStyle={{alignItems: 'center', paddingBottom:5}} 
                        className='pb-0.5 py-1 w-full'
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