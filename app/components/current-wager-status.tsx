import React, { useContext, useState } from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import HealthKitContext from './HealthkitContext';
import Svg, { Rect, Defs, Stop, RadialGradient } from 'react-native-svg';
import { InsetShadow } from 'react-native-inset-shadow';
import { Shadow } from 'react-native-shadow-2';
import { Ionicons } from '@expo/vector-icons';


type CurrentWagerProps = {
    wager: {
        wager_id: string;
        id: number;
        userId: string;
        amount: number;
        charity_name: string;
        start_date: string;
        end_date: string;
        token: string;
        status: string;
        ongoing: boolean;
    } | null;
};

const CurrentWager: React.FC<CurrentWagerProps> = ({ wager }) => {
    let status = wager !== null ? wager.status : 'noWager';
    let statusColor = 'black';
    let statusText = 'No Wager';

    switch (status) {
        case 'live':
            statusColor = 'green';
            statusText = 'Live';
            break;
        case 'inProgress':
            statusColor = 'orange';
            statusText = 'In Progress';
            break;
        case 'lost':
            statusColor = 'red';
            statusText = 'Lost';
            break;
        case 'noWager':
            statusColor = 'black';
            statusText = 'No Wager';
            break;
        default:
            break;
    }

    return (
        <View  className='h-1/3 w-full'>
            <Shadow startColor={'#050505'} paintInside={true} distance={6} style={{borderRadius: 10, flexDirection: "row", width: '100%', height:"100%" }}>
                <View style={{backgroundColor: "#0D0D0D"}} className="flex h-full rounded-lg w-full justify-center items-center">
                    <View className='h-full w-full flex-col justify-between items-center'>
                        <View className="flex-col w-full items-center">
                            <View style={{backgroundColor: "#71BC78", width: "90%", height:"18%"}} className="rounded-b items-center px-4 h-3" />
                            <View className="flex h-fit w-fit rounded-lg items-center bg-neutral-800 px-3 py-0.5 mt-1">
                                <Text className="text-neutral-300 text-center text-xs ">Workout Detected</Text>
                            </View>
                        </View>

                        {/* Todays Date in format: month abreviation day, year in large text */}
                        <View className="flex-row w-full justify-center items-end px-3">
                            <Text className="text-white text-left text-2xl">Day </Text>
                            <View className="h-fit w-6 rounded bg-neutral-800 px-1 py-1 mr-1 ">
                                <Text className="text-white text-center text-xl font-bold">0</Text>
                            </View>
                            <View className="h-fit w-6 rounded bg-neutral-800 px-1 py-1">
                                <Text className="text-white text-center text-xl font-bold">9</Text>
                            </View>
                        </View>
                        <View className="flex-row w-full justify-between items-center px-2">
                            <View className="flex justify-start">
                                <Text className="text-white text-left text-lg font-bold">Today's Workout:</Text>
                            </View>
                            <View className="h-fit w-fit p-2 rounded-full bg-neutral-800"> 
                                <Ionicons name="checkmark-done-outline" size={16} color="#71BC78" />
                            </View>
                        </View>

                        <View className="flex-row  w-full justify-end">
                            <View className="flex-row w-1/3 h-5 justify-center space-x-1 items-center border-l border-t rounded-tl border-neutral-800">
                                <View className="h-3 w-3 rounded-full bg-orange-400" />
                                <View className="h-3 w-3 rounded-full bg-rose-400"/>
                                <View className="h-3 w-3 rounded-full bg-green-400"/>
                                
                            </View>
                        
                        </View>

                        {/*<Svg height="100%" width="100%">
                            <Defs>
                                <RadialGradient id="grad" cx="50%" cy="-30%" rx="80%" ry="50%" fx="50%" fy="0%" gradientUnits="userSpaceOnUse">
                                    <Stop offset="5%" stopColor="#ffffff" stopOpacity="1" />
                                    <Stop offset="10%" stopColor="#71BC78" stopOpacity="1" />
                                    <Stop offset="70%" stopColor="#0D0D0D" stopOpacity="1" />
                                </RadialGradient>
                            </Defs>
                            <Rect height="100%" width="100%" fill="url(#grad)" rx={10} ry={10}/>
                            <View className="flex-row w-full justify-between items-center px-4 pt-3">
                                <View className="flex-col w-full justify-center">
                                    <Text className="text-white text-center text-md font-bold">WORKOUT DETECTED</Text>
                                </View>
                            </View>
                        </Svg>
                        */}
                    </View>
                </View>
            </Shadow>
        </View>
    );
};
export default CurrentWager;