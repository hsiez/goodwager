import React, { useContext, useEffect, useState } from 'react';
import { Text, View, Pressable, Modal, ScrollView, Image } from 'react-native';
import HealthKitContext from './HealthkitContext';
import * as SecureStore from 'expo-secure-store';
import { Shadow } from 'react-native-shadow-2';
import { Ionicons } from '@expo/vector-icons';
import supabaseClient from '../utils/supabase';
import { useAuth } from '@clerk/clerk-expo';
import { useIsFocused } from '@react-navigation/native';
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";

const TodayStatus = ({ wager_id, start_date, last_date_completed, streak }: { wager_id: string, start_date: string, last_date_completed: string, streak: number }) => {
    const isFocused = useIsFocused();
    const { healthKitAvailable, AppleHealthKit } = useContext(HealthKitContext);
    const { userId, getToken } = useAuth();
    const [workedOutToday, setWorkedoutToday] = useState(false);
    const [workoutData, setWorkoutData] = useState(null);
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


    switch (workedOutToday) {
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
            statusColor = 'rgb(64 64 64)';
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

    function handleHealthData(date: string) {
        if (healthKitAvailable) {
            const end_date = new Date(date);
            end_date.setDate(end_date.getDate() + 1);
            AppleHealthKit.getSamples(
                {
                    startDate: date,
                    endDate: end_date,
                    type: 'Workout', 
                },
                (err, results) => {
                    if (err) {
                        console.log('error', err);
                        return;
                    }
                    if (results.length > 0) {
                        console.log('Workout found', results);
                        setWorkedoutToday(true);
                        setWorkoutData(results[0]);
                    }
                }
            );
        }
    }
    async function updateWagerWithWorkout(today) {
        console.log('updating wager with workout');
        const supabase = supabaseClient(await getToken({ template: 'supabase' }));
        const { error } = await supabase
        .from('wagers')
        .update({ last_date_completed: today, streak: streak + 1 })
        .eq('wager_id', wager_id);
        if (error) {
            console.log('error updating last_date_completed', error);
            throw error;
        }
    }
    
    async function fetchNotifications() {
        /*
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
        */
       //spoof data for now
         setNotifications([
              {
                id: 1,
                sender: "John Doe",
                type: "Exercised Today"
              },
              {
                id: 2,
                sender: "Jane Doe",
                type: "Exercised Today"
              },
              {
                id: 3,
                sender: "John Doe",
                type: "Exercised Today"
              },
              {
                id: 4,
                sender: "Jane Doe",
                type: "Exercised Today"
              },
              {
                id: 5,
                sender: "John Doe",
                type: "Exercised Today"
              },
              {
                id: 6,
                sender: "Jane Doe",
                type: "Exercised Today"
              },
              {
                id: 7,
                sender: "John Doe",
                type: "Exercised Today"
              },
              {
                id: 8,
                sender: "Jane Doe",
                type: "Exercised Today"
              },
              {
                id: 9,
                sender: "John Doe",
                type: "Exercised Today"
              },
              {
                id: 10,
                sender: "Jane Doe",
                type: "Exercised Today"
              },
         ]);
    }

    const NotificationIcon = ({ type }) => {
        const notifColor = type === "Exercised Today" ?  "#00ff00" : "rgb(251 113 133)"
        return(
            <View style={{borderColor: notifColor}} className='flex justify-center items-center h-7 w-7 border  rounded-full'>
                
                    <Svg height="100%" width="100%" >
                        <Defs>
                            <RadialGradient id="grad" cx="50%" cy="50%" r="100%" fx="50%" fy="50%">
                                <Stop offset="32%" stopColor="#0D0D0D" stopOpacity="1" />
                                <Stop offset="100%" stopColor={notifColor} stopOpacity="1" />
                            </RadialGradient>
                        
                        </Defs>
                        <Circle cx="50%" cy="50%" r="50%" fill="url(#grad)"/>
                        <View className="flex h-full w-full justify-center items-center ">
                            {type === "Exercised Today" ?  <Ionicons name="sparkles-outline" size={12} color={notifColor} /> : <Ionicons name="barbell-outline" size={12} color={notifColor} />}
                        </View>
                    </Svg>      
            </View>
        )
    }

    useEffect(() => {
        async function getWorkoutData() {
            const today = new Date(new Date().setHours(0, 0, 0, 0));
            const today_string = today.toISOString();
            
            if (wager_id) {
                if (last_date_completed === today.toISOString()) {
                    setWorkedoutToday(true);
                } else {
                    handleHealthData(today_string);
                    if (workedOutToday) {
                        await updateWagerWithWorkout(today_string);
                        // Update the calendar with the workout data
                        let wager_tracker = JSON.parse(await SecureStore.getItemAsync('wager_tracker'));
                        wager_tracker[today_string].workedOut = true;
                        wager_tracker[today_string].workoutType = workoutData.workoutType;
                        SecureStore.setItemAsync('wager_tracker', JSON.stringify(wager_tracker));
                    }
                }
                const trueStartDate = new Date(start_date).setHours(0, 0, 0, 0);
                
                const diff = new Date(today).getTime() - new Date(trueStartDate).getTime();
                let Difference_In_Days = Math.round(diff / (1000 * 3600 * 24));
                if (Difference_In_Days < 10) {
                    setChallengeDay([0, Difference_In_Days]);
                } else {
                    setChallengeDay([Math.floor(Difference_In_Days / 10), Difference_In_Days % 10]);
                }
            }
        }
        getWorkoutData();
        fetchNotifications();
    }, [wager_id, isFocused]);

    return (
        <View  className='flex w-3/5 rounded-xl'>
            <Shadow startColor={'#050505'} paintInside={true} distance={4} style={{borderRadius: 12}}>
                <View style={{backgroundColor: "#0D0D0D"}} className="flex h-full w-full justify-center items-center border-neutral-800 rounded-xl border">
                    <View className='flex-col h-full w-full justify-between items-center'>
                        <View className="flex-col w-full h-1/3 items-center">
                            <View className="flex-row w-full h-1/6 justify-start items-start">
                                <View style={{backgroundColor: statusColor}} className="space-x-1 h-full w-3/4 rounded-b-lg border-neutral-800 border border-t-0 py-0.5"/>
                            </View>
                            <View className="flex-row w-full space-x-1">
                                <Text style={{fontSize: 8}} className="text-neutral-600">{statusText}</Text>
                               
                            </View>
                        </View>

                        {/* Todays Date in format: month abreviation day, year in large text */}
                        <View className="flex-row w-full h-1/3 justify-center items-center">
                            <View className='flex-row w-full justify-center'>
                                <Text className="text-white text-left text-2xl">Day </Text>
                            
                                <View className="flex-row h-fit w-fit space-x-0.5">
                                    <View className="h-fit w-6 rounded bg-neutral-800 py-1">
                                        <Text className="text-white text-center text-xl font-bold">{challengeDay[0]}</Text>
                                    </View>
                                    <View className="h-fit w-6 rounded bg-neutral-800 py-1">
                                        <Text className="text-white text-center text-xl font-bold">{challengeDay[1]}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        {/* Low right corner area for notifications */}
                        <View className="flex-row h-1/3 w-full items-end justify-end">
                            <Pressable onPress={() => setIsModalVisible(true)} className="flex-row w-1/3 h-4 justify-center space-x-1 items-center border-l border-t rounded-tl-lg border-neutral-800">
                                <View className="flex-row w-1/3 h-4 justify-center space-x-1 items-center">
                                    <View className="h-2 w-2 rounded-full bg-orange-400" />
                                    <View className="h-2 w-2 rounded-full bg-rose-400"/>
                                    <View className="h-2 w-2 rounded-full bg-green-400"/>
                                    
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
                                        width: '90%',
                                        height: '50%',
                                        backgroundColor: '#0D0D0D',
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
                                        <View style={{height: '80%', width: '90%'}} className=" border border-neutral-800 rounded-2xl">
                                            <ScrollView className="h-full w-full px-3 py-1">
                                                {notifications.map(notification => (
                                                    <View className="flex-row w-full h-10 justify-center items-center space-x-5">
                                                        <NotificationIcon type={notification.type} />
                                                        <View className='flex-row h-full space-x-2 items-center'>
                                                            <Text style={{fontSize: 14}} className="text-neutral-400 ">{notification.sender} sent you kudos:</Text>
                                                            <Text style={{fontSize: 12}} className="text-neutral-200 text-end">LFG!</Text>
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
            </Shadow>
        </View>
    );
};
export default TodayStatus;