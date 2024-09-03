import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Pressable, Modal, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import supabaseClient from '../utils/supabase';
import { Shadow } from 'react-native-shadow-2';
import { Ionicons, FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import { fetchUserFromUsername, fetchFollowerWagerData } from '../utils/clerk_apis';
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";
import { useIsFocused } from '@react-navigation/native';
import {Reaction} from 'react-native-reactions';
import AddUserModal from '../components/add_user_search';

// Define the FollowerCard component
const FollowerCard = ({follower}: {follower}) => {
    const isFocused = useIsFocused();
    const { userId, getToken } = useAuth();
    const {user} = useUser();
    const [followerData, setFollowerData] = useState(null);
    const [followerWagerData, setFollowerWagerData] = useState({amount: 0, end_date: null, start_date: null, status: '', last_date_completed: null, donated: null});
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
    }, [follower.followee, followerWagerData, isFocused ]);

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
        const workoutCompleted = new Date(wagerData.last_date_completed).toISOString() === today;
        setWorkedOutToday(workoutCompleted);
        setCardText(workoutCompleted ? "Today's Workout is Complete!" : "Today's Workout is Pending");

        // Set workout status text and color based on whether the workout was completed today
        switch (workoutCompleted) {
            case true:
                setWorkoutStatusText("Complete");
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
                setWagerStatusColor(wagerData.donated ? "#fb923c" : "#dc2626"); // orange-400 if donated, else red
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
            <Shadow startColor={'#050505'} distance={0} style={{borderRadius: 12, flexDirection: "row", width: '100%', height:"100%" }}>
                <View className="flex-col h-full w-full">
                    <View className="flex-row w-full h-fit justify-start items-center pl-3">
                        <View style={{backgroundColor: wagerStatusColor}} className="flex w-fit h-fit px-4 justify-center items-center rounded-t-lg">
                            <Text style={{ fontSize: 12 }} className="text-neutral-900 font-semibold">
                                {followerWagerData.status === 'failed' && followerWagerData.donated ? 'donated' : followerWagerData.status}
                            </Text>
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
                                        <View className='flex-row w-fit justify-start space-x-2'>
                                            <View className='flex-row px-2 py-0.5 justify-center items-center bg-neutral-700 rounded-3xl'>
                                                <Text style={{fontSize: 12}} className="text-xs text-neutral-300">${followerWagerData.amount}</Text>
                                            </View>

                                            {
                                            followerWagerData.status == "ongoing" ? (
                                                <View className='flex-row space-x-2'>
                                                    <View className='flex-row px-2 py-0.5 space-x-1 justify-center items-center bg-neutral-700 rounded-3xl'>
                                                        <FontAwesome6 name="flag-checkered" size={12} color={'#e5e5e5'} />
                                                        <Text style={{fontSize: 12}} className="text-xs text-neutral-300"> {new Date(followerWagerData.end_date).toLocaleString('default', { month: 'short', day: 'numeric'})}</Text>
                                                    </View>

                                                    <View className='flex-row px-2 space-x-1 justify-center items-center rounded-3xl bg-neutral-700'>
                                                        <Ionicons name="barbell" size={14} color={workoutStatusColor} />
                                                        <Text style={{fontSize: 12}} className="text-xs text-neutral-300"> {workoutStatusText}</Text>
                                                    </View>
                                                </View>
                                            ) : (
                                                <View className='flex-row space-x-2'>
                                                    <View className='flex-row px-2 py-0.5 space-x-1 justify-center items-center bg-neutral-700 rounded-3xl'>
                                                        <Ionicons name="checkmark-circle" size={14} color={'#9ca3af'} />
                                                        <Text style={{ fontSize: 12 }} className="text-neutral-300 font-normal ml-2">{
                                                            followerWagerData.last_date_completed
                                                            ? Math.floor((new Date(followerWagerData.last_date_completed).getTime() - new Date(followerWagerData.start_date).getTime()) / (1000 * 3600 * 24))
                                                            : 0}
                                                        </Text>
                                                        <Text style={{ fontSize: 12 }} className="text-neutral-300 font-normal mr-1">days</Text>
                                                    </View>
                                                    {
                                                    !followerWagerData.donated && (
                                                        <View className='flex-row px-2 space-x-1 justify-center items-center rounded-3xl bg-neutral-700'>
                                                            <Ionicons name="card" size={14} color="#9ca3af" />
                                                            <Text style={{fontSize: 12}} className="text-xs text-neutral-300">Pending</Text>
                                                        </View>)
                                                    }
                                                </View>

                                            )
                                            }
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
                            <View className='rounded-full item-center justify-center mr-1'>
                                {selectedEmoji ? (
                                    <Text style={{color: '#fff', fontSize: 44}}>{selectedEmoji.emoji}</Text>
                                    ) : (
                                    <MaterialIcons name="add-reaction" size={44} color="#090909" />
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

const FollowersList = ({ followers, refreshing, onRefresh }) => {
  return (
    <ScrollView 
      showsVerticalScrollIndicator={false} 
      contentContainerStyle={{alignItems: 'center', paddingBottom: 50}} 
      className='pb-0.5 py-1 w-full'
      style={{minWidth: '100%', height: "100%", paddingHorizontal: 6}}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#d4d4d4" // Color of the refresh indicator
        />
      }
    >
      {followers.map((follower) => (
        <FollowerCard key={follower.followee_un} follower={follower} />
      ))}
    </ScrollView>
  );
};

const Feed = () => {
  const isFocused = useIsFocused();
  const [followers, setFollowers] = useState([]);
  const { getToken, userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      const supabaseAccessToken = await getToken({ template: 'supabase' });
      const supabase = supabaseClient(supabaseAccessToken);

      // Fetch followers
      let { data: followersData, error: followersError } = await supabase
        .from('followers')
        .select()
        .eq('follower', userId);

      if (followersError) throw followersError;
      setFollowers(followersData || []);

      // Fetch notifications
      let { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select()
        .eq('receiver', userId);

      if (notificationsError) throw notificationsError;
      setNotifications(notificationsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, getToken]);

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused, fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#090909'}}>
        <ActivityIndicator size="large" color="#d4d4d4" />
      </View>
    );
  }

  return (
    <View style={{backgroundColor: "#090909"}} className="flex-col h-full justify-center items-center pt-5">
      <View className="flex-col px-1 w-full h-full justify-center items-center space-y-1 mt-20">
        {/* screen title */}
        <View className='flex-row w-full justify-end items-end px-2 pb-2 space-x-4'>
          {/* Search button to look up a user and add follow them */}
          <View className='flex-row w-fit h-fit justify-center items-center'>
            <AddUserModal />
          </View>

          {/* Notification bell button that opens modal to show notifications */}
          <View className='flex-row w-fit justify-end items-center'>
            <Pressable onPress={() => setIsModalVisible(true)} className="flex-row w-fit h-fit justify-center items-center">
              <Ionicons name="notifications" size={20} color="#e5e5e5" />
            </Pressable>
            <Modal
              animationType="slide"
              transparent={true}
              visible={isModalVisible}
              onRequestClose={() => setIsModalVisible(false)}
            >
              <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, .90)' // Semi-transparent background
              }}>
                <View style={{
                  flex: 0,
                  width: '95%',
                  height: '50%',
                  backgroundColor: '#080808',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 15, // Optional: for rounded corners
                  shadowColor: "#050505", // Optional: for shadow
                  shadowOffset: {
                    width: 2,
                    height: 2
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                }}>
                  <View className="flex-row w-full justify-start px-3 pb-2 items-center">
                    <Text style={{ fontSize: 12 }} className="text-neutral-200 ml-2 font-semibold">Friends Motivating You</Text>
                  </View>
                  <View style={{ height: '80%', width: '95%' }} className="border border-neutral-800 rounded-2xl">
                    <ScrollView className="h-full w-full px-1 pt-2">
                      {notifications.map(notification => (
                        <View key={notification.id} className="flex-row w-full h-fit mb-1 justify-between items-center  px-2 py-2 space-y-2 rounded-xl border-neutral-700">
                          <View className='flex-row w-fit h-fit items-start '>
                            <Text style={{ fontSize: 14 }} className="text-neutral-400 ">{notification.sender_un}</Text>
                            <Text style={{ fontSize: 14 }} className="text-neutral-200"> sent reaction:</Text>
                          </View>
                          <View className='flex-row w-fit h-fit'>
                            <Text style={{ fontSize: 14 }}>{notification.reaction}</Text>
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                  <View className="flex-row w-full justify-end pr-10 pt-4">
                    <Pressable onPress={() => setIsModalVisible(false)}>
                      <Text className='text-neutral-200'>Close</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        </View>
        <View style={{height:"95%"}} className='flex-row w-full'>
          {followers.length === 0 ? (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text className="text-neutral-700" style={{fontSize: 18}}>No Friends Yet</Text>
            </View>
          ) : (
            <FollowersList 
              followers={followers} 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default Feed;