import React, { useContext, useLayoutEffect, useState, useEffect } from 'react';
import { Text, View, Pressable, Modal, ScrollView, Image } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';
import supabaseClient from '../utils/supabase';
import { useIsFocused } from '@react-navigation/native';
import Svg, { Defs, RadialGradient, Stop, Circle, Rect, Line } from "react-native-svg";
import * as SecureStore from 'expo-secure-store';
import CornerBorder from './corner_border';
import { Activity_Colors, Activities } from '../utils/activity_map';


const TodayStatus = ({ wager_id, wager_status, start_date, selected_day, workouts, workout_duration }) => {
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

    const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

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

    useEffect(() => {
        async function pop_day_status() {
            if (!start_date) {
                return;
            }
    
            const challengeDay = Math.floor((new Date(selected_day).getTime() - new Date(start_date).getTime()) / (1000 * 3600 * 24));
    
            if (workoutEntries.length > 0) {
                const totalDuration = workoutEntries.reduce((sum, workout) => sum + workout.duration, 0);
                const totalCalories = workoutEntries.reduce((sum, workout) => sum + parseInt(workout.calories), 0);
                const workoutTypes = [...new Set(workoutEntries.map(workout => workout.type))];
    
                setSelectedDayData({
                    calories: totalCalories.toString(),
                    date: selected_day,
                    types: workoutTypes.join(', '),
                    duration: totalDuration,
                    challengeDay: challengeDay
                });
    
                if (totalDuration >= 60) {
                    console.log('Workout Goal Achieved');
                    setStatusColor('#71BC78');
                    setStatusText('Completed');
                    setWorkoutStatus("Complete");
                    setIcon('checkmark-done-circle-outline');
                    setIconColor('#0d0d0d');
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
    
            if (challengeDay < 10) {
                setChallengeDay([0, challengeDay]);
            } else {
                setChallengeDay([Math.floor(challengeDay / 10), challengeDay % 10]);
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
        if (wager_status && wager_status != "failed") {
            fetchWorkoutEntries(selected_day);
        }
    }, [selected_day]);

    if (!selected_day) {
        return null;
    }
    console.log('Selected Day:', selected_day);

    const renderProgressBar = () => {
        console.log("Rendering progress bar. Selected day data:", selectedDayData);
        console.log("Workout entries:", workoutEntries);

        const uniqueWorkoutTypes = [...new Set(workoutEntries.map(workout => workout.type))];
        
        const totalDuration = selectedDayData?.duration || 0;
        const maxDuration = Math.max(workout_duration, totalDuration);
        const barWidth = 280;
        const barHeight = 10;
        const verticalLineHeight = 20; // Height of the vertical line, extending beyond the bar

        let accumulatedWidth = 0;
        const segments = workoutEntries.map((workout, index) => {
            const segmentWidth = (workout.duration / maxDuration) * barWidth;
            const segment = (
                <Rect
                    key={index}
                    x={accumulatedWidth}
                    y={0}
                    width={segmentWidth}
                    height={barHeight}
                    fill={Activity_Colors[workout.type] || '#404040'}
                />
            );
            accumulatedWidth += segmentWidth;
            return segment;
        });

        const sixtyMinuteMark = (workout_duration / maxDuration) * barWidth;

        return (
            <View className="flex-1 items-center">
                <View className="flex-row justify-between mt-1 w-full">
                    <Text style={{ fontSize: 12 }} className="text-neutral-400">0 mins</Text>
                    <Text style={{ fontSize: 12 }} className="text-neutral-400">{maxDuration}</Text>
                </View>

                <Svg width={barWidth} height={verticalLineHeight}>
                    <Rect
                        x={0}
                        y={(verticalLineHeight - barHeight) / 2}
                        width={barWidth}
                        height={barHeight}
                        fill="#2D2D2D"
                    />
                    {segments.map(segment => React.cloneElement(segment, {
                        y: (verticalLineHeight - barHeight) / 2
                    }))}
                    <Line
                        x1={sixtyMinuteMark}
                        y1={0}
                        x2={sixtyMinuteMark}
                        y2={verticalLineHeight}
                        stroke="#FFFFFF"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                    />
                </Svg>

                <View className="flex-row flex-wrap min-w-full justify-start items-center mt-2">
                {uniqueWorkoutTypes.length > 0 ? (
                    uniqueWorkoutTypes.map((workout, index) => (
                        <View key={index} className="flex-row w-fit h-fit justify-center items-center space-x-2 mx-1">
                            <View style={{ backgroundColor: Activity_Colors[workout as string] || '#404040' }} className="h-2 w-2 rounded-full"></View>
                            <Text style={{ fontSize: 12 }} className="text-neutral-400">{Activities[workout as string]}</Text>
                        </View>
                    ))
                ) : (
                    <View className="flex-row w-fit h-fit justify-center items-center space-x-2 mx-1">
                        <View style={{ backgroundColor: '#2D2D2D' }} className="h-2 w-2 rounded-full"></View>
                        <Text style={{ fontSize: 12 }} className="text-neutral-400">No Workout Found</Text>
                    </View>
                )}
            </View>
            </View>
        );
    };

    return (
        <View className="flex h-full w-full justify-center items-center">
            <View className='flex w-5/6 rounded-xl justify-center relative'>
                <View className="flex-col min-h-full min-w-full justify-center items-center">
                    <View className="flex-row w-full h-fit justify-start items-center pl-4">
                        <View className="flex w-fit h-fit px-2 py-0.5 justify-center items-center rounded-t-lg bg-neutral-300">
                                <View className="flex-row w-fit h-fit justify-center items-center space-x-1 rounded-xl border-0 border-neutral-400">
                                    <Text style={{ fontSize: 12 }} className="text-neutral-700 font-semibold">{statusText}</Text>
                                    <Ionicons name={icon} size={14} color={iconColor} />
                                </View>
                        </View>
                    </View>
                    <View style={{backgroundColor: "#0D0D0D"}} className="flex-col flex-1 h-full w-full bg-neutral-900 rounded-2xl border border-neutral-400">
                        <View className='flex-col h-full w-full justify-center space-y-4 items-center px-4 pt-3 pb-10'>
                            {/*start_date && workoutStatus === "Complete"*/ true ? (
                                <View className="flex-row w-full flex-1 justify-center items-center">
                                    <View className="flex-col mt-1 w-full h-full justify-center items-start">
                                        {renderProgressBar()}
                                        <View className="flex-row  flex-1 w-full h-fit justify-between items-center">
                                            <View className='flex-row w-fit space-x-2 items-center'>
                                                <View className='flex-row w-fit h-fit justify-start items-center'>
                                                    <Ionicons name={"stopwatch-outline"} size={18} color={"#a3a3a3"} />
                                                </View>
                                                <View className='flex-row fit h-fit justify-start items-center'>
                                                    <Text style={{ fontSize: 12 }} className="text-neutral-400 font-medium">{selectedDayData?.duration || "0"} min</Text>
                                                </View>
                                            </View>

                                            <View className='flex-row w-fit space-x-2 items-center'>
                                                <View className='flex-row w-fit h-fit justify-start items-center'>
                                                    <Ionicons name={"flame-outline"} size={18} color={"#a3a3a3"} />
                                                </View>
                                                <View className='flex-row w-fit h-fit justify-start items-center'>
                                                    <Text style={{ fontSize: 12 }} className="text-neutral-400 font-medium">{selectedDayData?.calories || "0"} cals</Text>
                                                </View>
                                            </View>

                                            <View className='flex-row w-fit space-x-2 items-center'>
                                                <View className='flex-row w-fit h-fit justify-start items-center'>
                                                    <Ionicons name={"calendar-clear-outline"} size={18} color={"#a3a3a3"} />
                                                </View>
                                                <View className='flex-row w-fit h-fit justify-start items-center'>
                                                    <Text style={{ fontSize: 12 }} className="text-neutral-400 font-medium">{new Date(selectedDayData?.date || today).toLocaleString('default', { month: 'short', day: "numeric" })}</Text>
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
                    </View>
                </View>
            </View>
        </View>
    );
};

export default TodayStatus;
