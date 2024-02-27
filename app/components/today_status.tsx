import React, { useContext, useEffect, useState } from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
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
    let StatusIcon = () => { 
        return (    
            <Ionicons name="checkmark-done-outline" size={16} color="#71BC78" />
        )
    }
    const today = new Date().setHours(0, 0, 0, 0);


    switch (workedOutToday) {
        case true:
            statusColor = '#71BC78';
            statusText = 'Workout Detected';
            StatusIcon = () => { 
                return (    
                    <Ionicons name="checkmark-done-outline" size={16} color="#71BC78" />
                )
            }
            break;
        case false:
            statusColor = '#a1a1aa';
            statusText = 'No Workout Detected';
            StatusIcon = () => { 
                return (    
                    <Ionicons name="alert-outline" size={16} color="#fb7185" />
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
        <View  className='h-1/3 w-full'>
            <Shadow startColor={'#050505'} paintInside={true} distance={6} style={{borderRadius: 10, flexDirection: "row", width: '100%', height:"100%" }}>
                <View style={{backgroundColor: "#0D0D0D"}} className="flex h-full rounded-lg w-full justify-center items-center">
                    <View className='h-full w-full flex-col justify-between items-center'>
                        <View className="flex-col w-full items-center">
                            <View style={{backgroundColor: statusColor, width: "90%", height:"18%"}} className="rounded-b items-center px-4 h-3" />
                            <View className="flex h-fit w-fit rounded-lg items-center bg-neutral-800 px-3 py-0.5 mt-1">
                                <Text className="text-neutral-300 text-center text-xs ">{statusText}</Text>
                            </View>
                        </View>

                        {/* Todays Date in format: month abreviation day, year in large text */}
                        <View className="flex-row w-full justify-center items-end px-3">
                            <Text className="text-white text-left text-2xl">Day </Text>
                            <View className="h-fit w-6 rounded bg-neutral-800 px-1 py-1 mr-1 ">
                                <Text className="text-white text-center text-xl font-bold">{challengeDay[0]}</Text>
                            </View>
                            <View className="h-fit w-6 rounded bg-neutral-800 px-1 py-1">
                                <Text className="text-white text-center text-xl font-bold">{challengeDay[1]}</Text>
                            </View>
                        </View>
                        <View className="flex-row w-full justify-between items-center px-2">
                            <View className="flex justify-start">
                                <Text className="text-white text-left text-lg font-bold">Today's Workout:</Text>
                            </View>
                            <View className="h-fit w-fit p-2 rounded-full bg-neutral-800"> 
                                <StatusIcon />
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