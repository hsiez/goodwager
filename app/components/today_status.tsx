import React, { useContext, useEffect, useState } from 'react';
import { Text, View, Pressable, StyleSheet, TextBase } from 'react-native';
import HealthKitContext from './HealthkitContext';
import Svg, { Rect, Defs, Stop, RadialGradient } from 'react-native-svg';
import { InsetShadow } from 'react-native-inset-shadow';
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
                    <Ionicons name="alert-outline" size={9} color="#fb7185" />
                )
            }
            break;
        default:
            break;
    }

    useEffect(() => {
        if (wager_id) {
            const trueStartDate = new Date(start_date).setHours(0, 0, 0, 0);
            const diff = new Date(today).getTime() - new Date(trueStartDate).getTime();
            let Difference_In_Days = Math.round(diff / (1000 * 3600 * 24));
            console.log('Difference in days: ', Difference_In_Days);
            if (Difference_In_Days < 10) {
                setChallengeDay([0, Difference_In_Days]);
            } else {
                setChallengeDay([Math.floor(Difference_In_Days / 10), Difference_In_Days % 10]);
            }
        }
        
        if (healthKitAvailable) {
            AppleHealthKit.getSamples(
                {
                    startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
                    endDate:  new Date().toISOString(),
                    type: 'Workout', 
                },
                (err, results) => {
                    if (err) {
                        console.log('error', err);
                        return;
                    }
                    if (results.length > 0) {
                        setWorkedoutToday(true);
                        console.log('Workout Data: ', results.length);
                    }
                }
            );
        }
    }, [wager_id, healthKitAvailable]);

    return (
        <View  className='flex w-3/5 rounded-xl'>
            
            <Shadow startColor={'#050505'} paintInside={true} distance={4} style={{borderRadius: 12}}>
                <View style={{backgroundColor: "#0D0D0D"}} className="flex h-full w-full justify-center items-center border-neutral-800 rounded-xl border">
                    <View className='h-full w-full flex-col justify-between items-center'>
                        <View className="flex-col h-fit w-full items-center">
                            {/* top bar for status color indicator */}
                            <View className="flex-row space-x-1 h-fit w-fit rounded-b items-center border-neutral-800 border border-t-0 px-3 py-0.5">
                                <Text style={{fontSize:10}} className="text-neutral-300 text-center">{statusText}</Text>
                                <View className="h-fit w-fit p-0.5 rounded-full bg-neutral-800"> 
                                    <StatusIcon />
                                </View>
                            </View>
                        </View>

                        {/* Todays Date in format: month abreviation day, year in large text */}
                        <View className="flex-row w-full justify-center items-center ">
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
                        <View className="flex-row  w-full justify-end">
                            <View className="flex-row w-1/3 h-5 justify-center space-x-1 items-center border-l border-t rounded-tl border-neutral-800">
                                <View className="h-3 w-3 rounded-full bg-orange-400" />
                                <View className="h-3 w-3 rounded-full bg-rose-400"/>
                                <View className="h-3 w-3 rounded-full bg-green-400"/>
                                
                            </View>
                        
                        </View>
                    </View>
                </View>
            </Shadow>
        </View>
    );
};
export default TodayStatus;