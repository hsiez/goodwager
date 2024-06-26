import React, { useContext, useLayoutEffect, useState, useEffect } from 'react';
import { Text, View, Pressable, Modal, ScrollView, ImageBackground } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';
import supabaseClient from '../utils/supabase';
import { useIsFocused } from '@react-navigation/native';
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";
import * as SecureStore from 'expo-secure-store';
import CornerBorder from './corner_border';

const CARD_IMAGES = {
    green: require("../assets/images/today_white.png"),
    white: require("../assets/images/today_white.png"),
};

const TodayStatus = ({ start_date, selected_day, workouts }) => {
    const { userId, getToken } = useAuth();
    const isFocused = useIsFocused();
    const [challengeDay, setChallengeDay] = useState([0, 0]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [background, setBackground] = useState(CARD_IMAGES['white']);
    const [selectedDayData, setSelectedDayData] = useState(null);
    const [statusColor, setStatusColor] = useState('black');
    const [statusText, setStatusText] = useState('Workout Incomplete');
    const [workoutStatus, setWorkoutStatus] = useState("Incomplete");
    const [icon, setIcon] = useState<'ellipse-outline' | 'checkmark-done-circle-outline'>('ellipse-outline');
    const [iconColor, setIconColor] = useState('#e5e5e5');

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

            const foundWorkout = workouts.find(workout => {
                return new Date(workout.date).toISOString() === new Date(selected_day).toISOString();
            });

            if (foundWorkout) {
                setSelectedDayData({
                    calories: foundWorkout.calories,
                    date: foundWorkout.date,
                    type: foundWorkout.type,
                    duration: foundWorkout.duration,
                    challengeDay: Difference_In_Days
                });
            } else {
                setSelectedDayData(null);
            }

            if (Difference_In_Days < 10) {
                setChallengeDay([0, Difference_In_Days]);
            } else {
                setChallengeDay([Math.floor(Difference_In_Days / 10), Difference_In_Days % 10]);
            }

            if (foundWorkout) {
                console.log('Workout Detected');
                setStatusColor('#71BC78');
                setStatusText('Completed');
                setWorkoutStatus("Complete");
                setBackground(CARD_IMAGES['green']);
                setIcon('checkmark-done-circle-outline');
                setIconColor('#00ff00');
            } else {
                console.log('No Workout Detected');
                setStatusColor('rgb(253 186 116)');
                setStatusText('Incomplete');
                setBackground(CARD_IMAGES['white']);
                setIcon('ellipse-outline');
                setIconColor('rgb(163 163 163)');
            }
        }

        if (selected_day) {
            pop_day_status();
        }
        fetchNotifications();
    }, [selected_day, isFocused]);

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
                <View className="flex min-h-full min-w-full justify-center items-center">
                    <CornerBorder>
                        <View className='flex-col h-full w-full justify-between items-center px-4 py-4'>
                            <View className="flex-row w-full h-fit justify-between items-center">
                                < View className="flex w-fit h-fit px-2 py-1 justify-center items-center">
                                    <Text style={{ fontSize: 12 }} className="text-neutral-400 font-semibold">Day: {challengeDay[0]}{challengeDay[1]}</Text>
                                </View>
                                <View className="flex-row w-fit h-fit px-3 py-1 justify-center items-center space-x-2 rounded-xl bg-stone-700">
                                    <Text style={{ fontSize: 12 }} className="text-neutral-400 font-semibold">{statusText}</Text>
                                    <Ionicons name={icon} size={12} color={iconColor} />
                                </View>
                            </View>
                            {/*start_date && workoutStatus === "Complete"*/ true ? (
                                <View className="flex-row w-full h-fit justify-between items-center p-5">
                                    <View className="flex-col w-full h-fit justify-center items-center space-y-6">
                                        <View className="flex-row w-full justify-between items-center">
                                            <View className='flex-col w-fit justify-center items-center'>
                                                <View className='flex-row w-fit h-fit justify-start items-center border-emerald-400 border-b-2 pb-1 mb-1'>
                                                    <Text style={{ fontSize: 12 }} className="text-neutral-400 text-start font-bold px-6 rounded-2xl">Type</Text>
                                                </View>
                                                <View className='flex-row w-fit h-fit justify-start items-center'>
                                                    <Text style={{ fontSize: 12 }} className="text-neutral-400 text-start font-medium ">{selectedDayData?.type || "Pending"}</Text>
                                                </View>
                                            </View>

                                            <View className='flex-col w-fit justify-center items-center'>
                                                <View className='flex-row w-fit h-fit justify-start items-center border-rose-400 border-b-2 pb-1 mb-1'>
                                                    <Text style={{ fontSize: 12 }} className="text-neutral-400 text-start font-bold px-4 rounded-2xl">Calories</Text>
                                                </View>
                                                <View className='flex-row w-fit h-fit justify-center items-center'>
                                                    <Text style={{ fontSize: 12 }} className="text-neutral-400 font-medium">{selectedDayData?.calories || "0"}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View className="flex-row w-full justify-between items-center">
                                            <View className='flex-col w-fit justify-center items-center'>
                                                <View className='flex-row w-fit h-fit justify-start items-center border-yellow-400 border-b-2 pb-1 mb-1'>
                                                    <Text style={{ fontSize: 12 }} className="text-neutral-400 text-start font-bold  px-4 rounded-2xl">Duration</Text>
                                                </View>
                                                <View className='flex-row w-fit h-fit justify-start items-center'>
                                                    <Text style={{ fontSize: 12 }} className="text-neutral-400 text-start font-medium">{selectedDayData?.duration || "0 mins"}</Text>
                                                </View>
                                            </View>
                                            
                                            <View className='flex-col w-fit justify-center items-center'>
                                                <View className='flex-row w-fit h-fit justify-start items-center border-orange-400 border-b-2 pb-1 mb-1'>
                                                    <Text style={{ fontSize: 12 }} className="text-neutral-400 text-start font-bold px-6">Date</Text>
                                                </View>
                                                <View className='flex-row w-fit h-fit justify-start items-center'>
                                                    <Text style={{ fontSize: 10 }} className="text-neutral-400 font-medium">{new Date(selected_day).toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric'}) || ""}</Text>
                                                </View>
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
                    </CornerBorder>
                </View>
                <View className="absolute bottom-0 right-0 flex-row h-fit items-center justify-center">
                    <Pressable onPress={() => setIsModalVisible(true)} className="flex-row w-1/3 h-4 justify-center space-x-1 items-center">
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
