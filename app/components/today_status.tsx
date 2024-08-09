import React, { useContext, useLayoutEffect, useState, useEffect } from 'react';
import { Text, View, Pressable, Modal, ScrollView, Image } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';
import supabaseClient from '../utils/supabase';
import { useIsFocused } from '@react-navigation/native';
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";
import * as SecureStore from 'expo-secure-store';
import CornerBorder from './corner_border';


const TodayStatus = ({ wager_id, start_date, selected_day, workouts }) => {
    const { userId, getToken } = useAuth();
    const isFocused = useIsFocused();
    const [challengeDay, setChallengeDay] = useState([0, 0]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [selectedDayData, setSelectedDayData] = useState(null);
    const [statusColor, setStatusColor] = useState('black');
    const [statusText, setStatusText] = useState('Incomplete');
    const [workoutStatus, setWorkoutStatus] = useState("Incomplete");
    const [icon, setIcon] = useState<'ellipse-outline' | 'checkmark-done-circle-outline'>('ellipse-outline');
    const [iconColor, setIconColor] = useState('#e5e5e5');
    const [workoutEntries, setWorkoutEntries] = useState(workouts);

    async function fetchNotifications() {
        const supabase = supabaseClient(await getToken({ template: 'supabase' }));
        const { data, error } = await supabase
            .from('notifications')
            .select()
            .eq('receiver', userId);
        if (error) {
            console.error('Error fetching notifications:', error);
        } else {
            setNotifications(data);
        }
    }

    const NotificationIcon = ({ type }) => {
        const notifColor = type === "Exercised Today" ? "#00ff00" : "rgb(251 113 133)";
        const notifIcon = type === "Exercised Today" ? "sparkles-outline" : "barbell-outline";
        return (
            <View style={{ borderColor: notifColor }} className='flex justify-center items-center h-6 w-6 border rounded-full'>
                <Svg height="100%" width="100%">
                    <Defs>
                        <RadialGradient id="grad" cx="50%" cy="50%" r="100%" fx="50%" fy="50%">
                            <Stop offset="32%" stopColor="#0D0D0D" stopOpacity="1" />
                            <Stop offset="100%" stopColor={notifColor} stopOpacity="1" />
                        </RadialGradient>
                    </Defs>
                    <Circle cx="50%" cy="50%" r="50%" fill="url(#grad)" />
                    <View className="flex h-full w-full justify-center items-center ">
                        <Ionicons name={notifIcon as any} size={12} color={notifColor} />
                    </View>
                </Svg>
            </View>
        );
    };

    useEffect(() => {
        async function pop_day_status() {
            if (!start_date) {
                return;
            }
    
            const tracker = JSON.parse(await SecureStore.getItemAsync("wager_tracker"));
            const selectedCache = tracker[selected_day];
            const Difference_In_Days = selectedCache.challengeDay;
    
            if (workoutEntries.length > 0) {
                const totalDuration = workoutEntries.reduce((sum, workout) => sum + workout.duration, 0);
                const totalCalories = workoutEntries.reduce((sum, workout) => sum + parseInt(workout.calories), 0);
                const workoutTypes = [...new Set(workoutEntries.map(workout => workout.type))];
    
                setSelectedDayData({
                    calories: totalCalories.toString(),
                    date: selected_day,
                    types: workoutTypes.join(', '),
                    duration: totalDuration,
                    challengeDay: Difference_In_Days
                });
    
                if (totalDuration >= 60) {
                    console.log('Workout Goal Achieved');
                    setStatusColor('#71BC78');
                    setStatusText('Completed');
                    setWorkoutStatus("Complete");
                    setIcon('checkmark-done-circle-outline');
                    setIconColor('#00ff00');
                } else {
                    console.log('Workout Goal Not Yet Achieved');
                    setStatusColor('rgb(253 186 116)');
                    setStatusText('In Progress');
                    setIcon('ellipse-outline');
                    setIconColor('rgb(163 163 163)');
                }
            } else {
                setSelectedDayData(null);
                console.log('No Workouts Today');
                setStatusColor('rgb(253 186 116)');
                setStatusText('Incomplete');
                setIcon('ellipse-outline');
                setIconColor('rgb(163 163 163)');
            }
    
            if (Difference_In_Days < 10) {
                setChallengeDay([0, Difference_In_Days]);
            } else {
                setChallengeDay([Math.floor(Difference_In_Days / 10), Difference_In_Days % 10]);
            }
        }
    
        if (selected_day) {
            pop_day_status();
        }
        fetchNotifications();
    }, [selected_day, workoutEntries, isFocused]);

    useEffect(() => {
        async function fetchWorkoutEntries(today: string) {
            const supabase = supabaseClient(await getToken({ template: 'supabase' }));
          
            const { data: workoutData, error: workoutError } = await supabase
              .from('workouts')
              .select()
              .eq('wager_id', wager_id)
              .eq('date', today)
              .order('date', { ascending: true });
          
            if (workoutError) {
              console.log('Error fetching workouts:', workoutError);
              return;
            }
            
            setWorkoutEntries(workoutData);
        }
        fetchWorkoutEntries(selected_day);
    }, [selected_day]);

    const notif_type = (status) => {
        if (status === "Exercised Today") {
            return "kudos";
        }
        return "motivation";
    };

    const notif_caption = (status) => {
        if (status === "Exercised Today") {
            return "Nice Work!";
        }
        return "Get To It!";
    };

    if (!selected_day) {
        return null;
    }
    console.log('Selected Day:', selected_day);

    return (
        <View className="flex h-full w-full justify-center items-center">
            <View className='flex w-4/5 rounded-xl justify-center relative'>
                <View className="flex-col min-h-full min-w-full justify-center items-center">
                    <View className="flex-row w-full h-fit justify-start items-center pl-4">
                        <View className="flex w-fit h-fit px-2 py-0.5 justify-center items-center rounded-t-lg bg-neutral-300">
                            <Text style={{ fontSize: 12 }} className="text-neutral-700 font-semibold">Day: {challengeDay[0]}{challengeDay[1]}</Text>
                        </View>
                    </View>
                    <View style={{backgroundColor: "#0D0D0D"}} className="flex-col flex-1 h-full w-full bg-neutral-900 rounded-2xl border border-neutral-400">
                        <View className='flex-col h-full w-full justify-between items-center px-4 py-5'>
                            <View className="flex-row w-full h-fit justify-between items-center">
                                <View className="flex-row w-fit h-fit justify-center items-center space-x-1 rounded-xl border-0 border-neutral-400">
                                    <Text style={{ fontSize: 12 }} className="text-neutral-400 font-semibold">{statusText}</Text>
                                    <Ionicons name={icon} size={14} color={iconColor} />
                                </View>
                            </View>
                            {/*start_date && workoutStatus === "Complete"*/ true ? (
                                <View className="flex-row w-full h-fit justify-between items-center px-3">
                                    <View className="flex-col w-full h-fit justify-center items-center space-y-3">
                                        <View className='flex-row w-full justify-center items-center'>
                                            <View className='flex-row flex-1 h-fit justify-start items-center'>
                                                <Text style={{ fontSize: 14 }} className="text-neutral-400 text-start font-bold rounded-2xl">Type</Text>
                                            </View>
                                            <View className='flex-row flex-1 h-fit justify-start items-center'>
                                                <Text style={{ fontSize: 12 }} className="text-neutral-400 text-start font-medium ">{selectedDayData?.types || "Pending"}</Text>
                                            </View>
                                        </View>

                                        <View className='flex-row w-full justify-center items-center'>
                                            <View className='flex-row flex-1 h-fit justify-start items-center'>
                                                <Text style={{ fontSize: 14 }} className="text-neutral-400 text-start font-bold rounded-2xl">Calories</Text>
                                            </View>
                                            <View className='flex-row flex-1 h-fit justify-start items-center'>
                                                <Text style={{ fontSize: 12 }} className="text-neutral-400 font-medium">{selectedDayData?.calories || "0"}</Text>
                                            </View>
                                        </View>
                                        <View className='flex-row w-full justify-center items-center'>
                                            <View className='flex-row flex-1 h-fit justify-start items-center'>
                                                <Text style={{ fontSize: 14 }} className="text-neutral-400 text-start font-bold rounded-2xl">Duration</Text>
                                            </View>
                                            <View className='flex-row flex-1 h-fit justify-start items-center'>
                                                <Text style={{ fontSize: 12 }} className="text-neutral-400 text-start font-medium">{selectedDayData?.duration || "0 mins"}</Text>
                                            </View>
                                        </View>
                                        
                                        <View className='flex-row w-full justify-start items-center'>
                                            <View className='flex-row flex-1 h-fit justify-start items-center'>
                                                <Text style={{ fontSize: 14 }} className="text-neutral-400 text-start font-bold">Date</Text>
                                            </View>
                                            <View className='flex-row flex-1 h-fit justify-start items-center'>
                                                <Text style={{ fontSize: 10 }} className="text-neutral-400 font-medium">{new Date(selected_day).toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric'}) || ""}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <View className="flex-1 w-full justify-center items-center">
                                    <View className="flex w-fit h-fit justify-center items-center px-4 py-4">
                                        <Text style={{ fontSize: 20 }} className="text-neutral-800">Workout Pending</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
                <View className="absolute bottom-1 right-0 flex-row h-fit items-center justify-center">
                    <Pressable onPress={() => setIsModalVisible(true)} className="flex-row w-1/5 h-4 justify-center items-center">
                        {notifications.length > 0 ? (
                            <View className="flex-row w-1/3 h-4 justify-center items-center">
                            <View className="h-4 w-4 rounded-full border overflow-hidden">
                                <Image className="h-full w-full" source={require('../assets/images/icon-1.png')} />
                            </View>
                            <View 
                                style={{ marginLeft: -5, borderColor: "#0D0D0D" }} 
                                className="h-4 w-4 rounded-full border overflow-hidden"
                            >
                                <Image className="h-full w-full" source={require('../assets/images/icon-2.png')} />
                            </View>
                            <View 
                                style={{ marginLeft: -5, borderColor: "#0D0D0D" }} 
                                className="h-4 w-4 rounded-full border overflow-hidden"
                            >
                                <Image className="h-full w-full" source={require('../assets/images/icon-3.png')} />
                            </View>
                            </View>
                        ) : null}
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
                                    <ScrollView className="h-full w-full px-1 pt-1">
                                        {notifications.map(notification => (
                                            <View style={{ backgroundColor: "#0D0D0D" }} key={notification.id} className="flex-col w-full h-fit mb-1 justify-between items-center px-2 py-2 space-y-2 border-0.5 rounded-xl border-neutral-700">
                                                <View className='flex-row w-full h-fit items-start'>
                                                    <Text style={{ fontSize: 12 }} className="text-neutral-400 ">{notification.sender_un}</Text>
                                                    <Text style={{ fontSize: 12 }} className="text-neutral-200"> sent {notif_type(notification.receiver_status)}:</Text>
                                                </View>
                                                <View className='flex-row w-fit h-fit space-x-2 items-center'>
                                                    <NotificationIcon type={notification.receiver_status} />
                                                    <Text style={{ fontSize: 12 }} className="text-neutral-200 text-end">{notif_caption(notification.receiver_status)}</Text>
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
        </View>
    );
};

export default TodayStatus;
