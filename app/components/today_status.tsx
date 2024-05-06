import React, { useContext, useEffect, useState } from 'react';
import { Text, View, Pressable, Modal, ScrollView, Image, ImageBackground } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';
import supabaseClient from '../utils/supabase';
import { useIsFocused } from '@react-navigation/native';
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";


const CARD_IMAGES = {
    green: require("../assets/images/today_green.png"),
    white: require("../assets/images/today_white.png"),
  };

const TodayStatus = ({ start_date, worked_out_today }: {start_date: string, worked_out_today: boolean }) => {
    const { user } = useUser();
    const { userId, getToken } = useAuth();
    const isFocused = useIsFocused();
    const [challengeDay, setChallengeDay] = useState([0, 0]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [notifications, setNotifications] = useState([]);
    let statusColor = 'black';
    let statusText = 'No Workout Detected';
    let workoutStatus = "Incomplete";
    let StatusIcon = () => { 
        return (    
            <Ionicons name="checkmark-done-outline" size={9} color="#71BC78" />
        )
    }


    switch (worked_out_today) {
        case true:
            statusColor = '#71BC78';
            statusText = 'Workout Detected';
            workoutStatus = "Complete";
            StatusIcon = () => { 
                return (    
                    <Ionicons name="checkmark-done-outline" size={9} color="#71BC78" />
                )
            }
            break;
        case false:
            statusColor = 'rgb(253 186 116)';
            statusText = 'No Workout Detected';
            StatusIcon = () => { 
                return (    
                    <Ionicons name="alert-outline" size={9} color="rgb(248 113 113)" />
                )
            }
            break;
        default:
            break;
    }
    
    async function fetchNotifications() {

        const supabase = supabaseClient(await getToken({ template: 'supabase' }));
        const { data, error } = await supabase
            .from('notifications')
            .select()
            .eq('receiver', userId); // Assuming 'user.id' is the current user's ID
        if (error) {
            console.error('Error fetching notifications:', error);
        } else {
            setNotifications(data);
        }
    }

    const NotificationIcon = ({ type }) => {
        const notifColor = type === "Exercised Today" ?  "#00ff00" : "rgb(251 113 133)"
        const notifIcon = type === "Exercised Today" ? "sparkles-outline" : "barbell-outline";
        return(
            <View style={{borderColor: notifColor}} className='flex justify-center items-center h-6 w-6 border  rounded-full'>
                
                    <Svg height="100%" width="100%" >
                        <Defs>
                            <RadialGradient id="grad" cx="50%" cy="50%" r="100%" fx="50%" fy="50%">
                                <Stop offset="32%" stopColor="#0D0D0D" stopOpacity="1" />
                                <Stop offset="100%" stopColor={notifColor} stopOpacity="1" />
                            </RadialGradient>
                        
                        </Defs>
                        <Circle cx="50%" cy="50%" r="50%" fill="url(#grad)"/>
                        <View className="flex h-full w-full justify-center items-center ">
                            <Ionicons name={`${notifIcon}`} size={12} color={notifColor} />
                        </View>
                    </Svg>      
            </View>
        )
    }
    
    useEffect(() => {
        async function setWorkoutDay() {
            if (!start_date) {
                return;
            }
            const today = new Date(new Date().setHours(0, 0, 0, 0));
            const trueStartDate = new Date(start_date);     
            const diff = new Date(today).getTime() - new Date(trueStartDate).getTime();
            const Difference_In_Days = Math.round(diff / (1000 * 3600 * 24)) + 1;
            
            if (Difference_In_Days < 10) {
                setChallengeDay([0, Difference_In_Days]);
            } else {
                setChallengeDay([Math.floor(Difference_In_Days / 10), Difference_In_Days % 10]);
            }
        }
        setWorkoutDay();
        fetchNotifications();
    }, [start_date, worked_out_today, isFocused]);


    const notif_type = (status) => {
        if (status === "Exercised Today") {
            return "kudos";
        }
        return "motivation";
    }

    const notif_caption = (status) => {
        if (status === "Exercised Today") {
            return "Nice Work!";
        }
        return "Get To It!";
    }
    const bg_key = worked_out_today ? "green" : "white";
    const day_bg = CARD_IMAGES[bg_key];
    return (
        <View  className='flex w-3/5 rounded-xl'>
            <Shadow startColor={'black'} distance={5} style={{borderRadius: 15}}>
                <View style={{backgroundColor: "#0D0D0D"}} className="flex min-h-full min-w-full justify-center items-center rounded-2xl">
                    <ImageBackground source={day_bg} resizeMode="stretch" style={{minWidth: '100%', height: '100%'}}>
                    <View className='flex-col h-full w-full justify-between items-center'>
                        <View className="flex-col w-full h-fit items-center rounded-b border-0.5 border-t-0 p-0.5 border-neutral-400">
                            <View className="flex-row w-full space-x-1">
                                <Text style={{fontSize: 8}} className="text-neutral-800">{statusText}</Text>
                            </View>
                        </View>

                        {/* Todays Date in format: month abreviation day, year in large text */}
                        <View className="flex-row w-full h-1/3 justify-center items-center ">
                            <View className='flex-row w-full justify-center items-center'>
                                <Text className="text-white text-left text-2xl">Day </Text>
                            
                                <View className="flex-row h-fit w-fit space-x-0.5">
                                    <View className="h-7 w-5 rounded bg-neutral-800 border border-neutral-600 justify-center">
                                        <Text className="text-white text-center text-md font-bold">{challengeDay[0]}</Text>
                                    </View>
                                    <View className="h-7 w-5 rounded bg-neutral-800 border border-neutral-600 justify-center">
                                        <Text className="text-white text-center text-md font-bold">{challengeDay[1]}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        {/* Low right corner area for notifications */}
                        <View className="flex-row h-fit w-full items-end justify-end ">
                            <Pressable onPress={() => setIsModalVisible(true)} className="flex-row w-1/3 h-4 justify-center space-x-1 items-center border-l border-t rounded-tl-lg border-neutral-600">
                                <View className="flex-row w-1/3 h-4 justify-center space-x-1 items-center">
                                    <View className={`h-2 w-2 rounded-full ${notifications.length > 0 ? 'bg-green-400' : 'bg-neutral-300'}`} />
                                    <View className={`h-2 w-2 rounded-full ${notifications.length > 0 ? 'bg-orange-400' : 'bg-neutral-500'}`} />
                                    <View className={`h-2 w-2 rounded-full ${notifications.length > 0 ? 'bg-rose-400' : 'bg-neutral-700'}`} />
                                    
                                </View>
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
                                            <Text style={{fontSize: 12}} className="text-neutral-200 ml-2 font-semibold">Friends Motivating You</Text>
                                        </View>
                                        <View style={{height: '80%', width: '95%'}} className=" border border-neutral-800 rounded-2xl">
                                            <ScrollView className="h-full w-full px-1 pt-1">
                                                {notifications.map(notification => (
                                                    <View style={{backgroundColor: "#0D0D0D"}} key={notification.id} className="flex-col w-full h-fit mb-1 justify-between items-center px-2 py-2 space-y-2 border-0.5 rounded-xl border-neutral-700">
                                                        <View className='flex-row w-full h-fit items-start'>
                                                            <Text style={{fontSize: 12}} className="text-neutral-400 ">{notification.sender_un}</Text>
                                                            <Text style={{fontSize: 12}} className="text-neutral-200"> sent {notif_type(notification.receiver_status)}:</Text>
                                                        </View>
                                                        <View className='flex-row w-fit h-fit space-x-2 items-center'>
                                                            <NotificationIcon type={notification.receiver_status} />
                                                            <Text style={{fontSize: 12}} className="text-neutral-200 text-end">{notif_caption(notification.receiver_status)}</Text>
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
                    </ImageBackground>
                </View>
            </Shadow>
        </View>
    );
};
export default TodayStatus;