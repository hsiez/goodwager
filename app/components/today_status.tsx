import React, { useContext, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import HealthKitContext from './HealthkitContext';
import * as SecureStore from 'expo-secure-store';
import { Shadow } from 'react-native-shadow-2';
import { Ionicons } from '@expo/vector-icons';
import supabaseClient from '../utils/supabase';
import { useAuth } from '@clerk/clerk-expo';
import { useIsFocused } from '@react-navigation/native';

const TodayStatus = ({ wager_id, start_date, last_date_completed }: { wager_id: string, start_date: string, last_date_completed: string }) => {
    const isFocused = useIsFocused();
    const { healthKitAvailable, AppleHealthKit } = useContext(HealthKitContext);
    const { getToken } = useAuth();
    const [workedOutToday, setWorkedoutToday] = useState(false);
    const [workoutData, setWorkoutData] = useState(null);
    const [challengeDay, setChallengeDay] = useState([0, 0]);
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
        .update({ last_date_completed: today})
        .eq('wager_id', wager_id);
        if (error) {
            console.log('error updating last_date_completed', error);
            throw error;
        }
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
                            <View className="flex-row w-1/3 h-4 justify-center space-x-1 items-center border-l border-t rounded-tl-lg border-neutral-800">
                                <View className="h-2 w-2 rounded-full bg-orange-400" />
                                <View className="h-2 w-2 rounded-full bg-rose-400"/>
                                <View className="h-2 w-2 rounded-full bg-green-400"/>
                                
                            </View>
                        
                        </View>
                    </View>
                </View>
            </Shadow>
        </View>
    );
};
export default TodayStatus;