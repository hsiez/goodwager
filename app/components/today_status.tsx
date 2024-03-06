import React, { useContext, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import HealthKitContext from './HealthkitContext';
import * as SecureStore from 'expo-secure-store';
import { Shadow } from 'react-native-shadow-2';
import { Ionicons } from '@expo/vector-icons';



const TodayStatus = ({ wager_id, start_date }: { wager_id: boolean, start_date }) => {
    const { healthKitAvailable, AppleHealthKit } = useContext(HealthKitContext);
    const [workedOutToday, setWorkedoutToday] = useState(false);
    const [challengeDay, setChallengeDay] = useState([0, 0]);
    let statusColor = 'black';
    let statusText = 'No Workout Detected';
    let workoutStatus = "Incomplete";
    let StatusIcon = () => { 
        return (    
            <Ionicons name="checkmark-done-outline" size={9} color="#71BC78" />
        )
    }
    const today = new Date().setHours(0, 0, 0, 0);


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
            statusColor = '#a1a1aa';
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

    function getHealthData(date: string) {
        const { healthKitAvailable, AppleHealthKit } = useContext(HealthKitContext);
        if (healthKitAvailable) {
            AppleHealthKit.getSamples(
                {
                    startDate: date,
                    endDate:  date,
                    type: 'Workout', 
                },
                (err, results) => {
                    if (err) {
                        console.log('error', err);
                        return;
                    }
                    if (results.length > 0) {
                        return (results[0]);
                    }
                    return null;
                }
            );
        }
    }
    

    useEffect(() => {
        async function getWorkoutData() {
            const today = new Date().setHours(0, 0, 0, 0);
            if (wager_id) {
                const trueStartDate = new Date(start_date).setHours(0, 0, 0, 0);
                const diff = new Date(today).getTime() - new Date(trueStartDate).getTime();
                let Difference_In_Days = Math.round(diff / (1000 * 3600 * 24));
                if (Difference_In_Days < 10) {
                    setChallengeDay([0, Difference_In_Days]);
                } else {
                    setChallengeDay([Math.floor(Difference_In_Days / 10), Difference_In_Days % 10]);
                }
            }
            

                
            const last_cached_date = await SecureStore.getItemAsync('last_cached_date');
            const today_string = new Date(today).toISOString()
            if (last_cached_date != today_string) {
                const results = getHealthData(today_string);
                if (results === null) {
                    return;
                }
                let wager_tracker = JSON.parse(await SecureStore.getItemAsync('wager_tracker'));
                wager_tracker[today].workedOut = true;
                wager_tracker[today].workoutType = results[0].workoutType;
                SecureStore.setItemAsync('wager_tracker', JSON.stringify(wager_tracker));
                SecureStore.setItemAsync('last_cached_date', today_string);
            }
            setWorkedoutToday(true);
        }
        getWorkoutData();
    }, [wager_id]);

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