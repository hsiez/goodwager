import { View, Text, Pressable, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import React, { useState, useContext, useEffect, useLayoutEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-expo';
import TodayStatus from '../../components/today_status';
import WagerCalendar from '../../components/wager_calendar';
import { Link } from "expo-router";
import supabaseClient from '../../utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import HealthKitContext from '../../components/HealthkitContext';
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { debounce } from 'lodash';
import registerForPushNotificationsAsync  from '../../utils/push_token';

const ShimmerButton = ({ title, onPress }) => {
  const [isShimmering, setIsShimmering] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsShimmering((prevState) => !prevState);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Link href="/wager/create" asChild>
      <TouchableOpacity
        onPress={onPress}
        className='flex-row px-2 py-1 justify-start items-center rounded-md border rounded-md border-neutral-500 bg-neutral-100'
      >
        <Text style={{ fontSize: 10 }} className="text-neutral-950 mr-1 font-semibold">{title}</Text>
        <FontAwesome6 name="edit" size={10} color={'#0a0a0a'} />
        <ShimmerPlaceholder
          visible={false}
          style={{
            width: "auto",
            height: "auto",
            borderRadius: 6,
          }}
          shimmerStyle={{
            backgroundColor: 'rgb(0, 0, 0, 0)',
            position: 'absolute',
            opacity: 0.3,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 24,
            autoRun: true
          }}
          duration={3000}
          shimmerColors={['#737373', '#ffffff', '#737373']}
          LinearGradient={LinearGradient}
          shimmerWidthPercent={0.2}
        />
      </TouchableOpacity>
    </Link>
  );
};

const WagerInfo = ({ latest_wager, hasActiveWager }) => {
  const [amount, setAmount] = useState(0);
  const [statusTitle, setStatusTitle] = useState('UNACTIVE');
  const [statusTitleColor, setStatusTitleColor] = useState('text-neutral-500');
  const [start, setStart] = useState('TBD');
  const [end, setEnd] = useState('TBD');

  useLayoutEffect(() => {
    if (latest_wager.wager_id != null) {
      if (latest_wager.status === 'ongoing') {
        setStatusTitle('ACTIVE');
        setStatusTitleColor('text-neutral-300');
      }
      if (latest_wager.status === 'completed') {
        setStatusTitle('COMPLETED WAGER');
        setStatusTitleColor('text-emerald-500');
      }
      if (latest_wager.status === 'failed') {
        setStatusTitle('FAILED WAGER');
        setStatusTitleColor('text-rose-400');
      }
      setStart(new Date(latest_wager.start_date).toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' }));
      setEnd(new Date(latest_wager.end_date).toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' }));
      setAmount(latest_wager.amount);
    }
  }, [latest_wager, hasActiveWager]);

  return (
    <View className='flex w-full items-center'>
      <View style={{ height: 103 }} className="flex-row w-full justify-between items-center mt-10 px-4">
        {/* Left half */}
        <View className='flex-col justify-center items-start w-1/2 space-y-1'>
          <Text style={{ fontSize: 16 }} className="text-neutral-600 font-medium">On the Line</Text>
          <View className='flex-row items-center'>
            <Text className="text-3xl text-neutral-400">$</Text>
            <Text className="text-3xl text-neutral-400">{amount}</Text>
          </View>
          {hasActiveWager ? (
            <View className='flex-row items-center space-x-1'>
              <Text style={{ fontSize: 16 }} className="text-neutral-600 font-medium">To:</Text>
              <Text numberOfLines={1} ellipsizeMode='tail' style={{ fontSize: 16 }} className=" text-neutral-400 max-w-[180px]">{latest_wager.charity_name}</Text>
            </View>
          ) : (
            <View className='px-2 border-dashed border border-neutral-800 rounded-xl'>
              <Text className="text-xl text-neutral-800">your fav charity</Text>
            </View>
          )}
        </View>

        {/* Right half */}
        <View className='flex-col space-y-1 w-1/2 items-end'>
          <View className='flex-row px-3 py-1 space-x-2 justify-center items-center rounded-md bg-neutral-900'>
            <FontAwesome6 name="flag" size={10} color={'#00ff00'} />
            <Text style={{ fontSize: 12 }} className="text-neutral-400 font-medium ml-1">{start}</Text>
          </View>
          <View className='flex-row px-3 py-1 space-x-2 justify-center items-center bg-neutral-900 rounded-md'>
            <FontAwesome6 name="flag-checkered" size={10} color={'#e5e5e5'} />
            <Text style={{ fontSize: 12 }} className="text-neutral-400 font-medium ml-1">{end}</Text>
          </View>
          <View className='flex-row px-3 py-1 space-x-2 justify-center items-center bg-neutral-900 rounded-md'>
            <Ionicons name="stopwatch-outline" size={14} color={'#e5e5e5'} />
            <Text style={{ fontSize: 12 }} className="text-neutral-400 font-medium ml-1">{latest_wager.workout_duration || 0} min</Text>
          </View>
        </View>
      </View>
    </View>
  );
}


const Wager = () => {
  const isFocused = useIsFocused();
  const [hasActiveWager, setHasActiveWager] = useState(false);
  const [wager, setWager] = useState({ wager_id: null, user_id: null, start_date: null, end_date: null, status: null, charity_id: null, amount: 0, last_date_completed: null, workout_duration: 30, charity_name: null, charity_ein: null});
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const { user } = useUser();
  const { healthKitAvailable, AppleHealthKit } = useContext(HealthKitContext);
  const [selectedDay, setSelectedDay] = useState(new Date(new Date().setHours(0, 0, 0, 0)).toISOString());
  const [workoutEntries, setWorkoutEntries] = useState([]);
  const [pushToken, setPushToken] = useState(null);

  function handleHealthData(date: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (healthKitAvailable) {
        const end_date = new Date(date);
        end_date.setDate(end_date.getDate() + 1);
        AppleHealthKit.getSamples(
          {
            startDate: date,
            endDate: end_date.toISOString(),
            type: 'Workout',
          },
          (err, results) => {
            if (err) {
              console.log('error', err);
              reject(err);
            } else {
              resolve(results);
            }
          }
        );
      } else {
        resolve([]);
      }
    });
  }


  const debouncedFetch = debounce((fetchFunction) => {
    fetchFunction();
  }, 300); // 300ms delay

  useEffect(() => {
    let isSubscribed = true;
    const abortController = new AbortController();
    setLoading(true);
  
    const fetchWager = async () => {
      try {
        console.log('fetching wager');
        const supabaseAccessToken = await getToken({ template: 'supabase' });
        const supabase = supabaseClient(supabaseAccessToken);
  
        const { data, error } = await supabase
          .from('wagers')
          .select()
          .eq('user_id', user.id)
          .eq('status', 'ongoing')
          .abortSignal(abortController.signal);
  
        if (error) throw error;
  
        if (isSubscribed && data.length > 0) {
          const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
          setHasActiveWager(true);
          setWager(data[0]);
        } else {
          setHasActiveWager(false);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('An error occurred while fetching the wager:', error);
        }
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };
  
    if (user) {
      debouncedFetch(fetchWager);
    }
  
    return () => {
      isSubscribed = false;
      abortController.abort();
      debouncedFetch.cancel();
    };
  }, [user, isFocused, wager.wager_id]);


  useEffect(() => {
    let isSubscribed = true;
    const abortController = new AbortController();
  
    const fetchAndUpdateWorkouts = async () => {
      if (!wager.wager_id) return;
  
      const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  
      try {
        console.log('Fetching and updating workouts');
        const supabaseAccessToken = await getToken({ template: 'supabase' });
        const supabase = supabaseClient(supabaseAccessToken);
  
        // Fetch workouts from Supabase
        const { data: supabaseWorkouts, error: supabaseError } = await supabase
          .from('workouts')
          .select("*")
          .eq('wager_id', wager.wager_id)
          .eq('date', today)
          .abortSignal(abortController.signal);
  
        if (supabaseError) throw supabaseError;
  
        // Fetch workouts from HealthKit
        const healthKitWorkouts = await handleHealthData(today);
  
        // Compare and find new workouts
        const newWorkouts = healthKitWorkouts.filter(hkWorkout => {
          return !supabaseWorkouts.some(dbWorkout => 
            dbWorkout.id === hkWorkout.id
          );
        });
  
        // Insert new workouts into Supabase
        if (newWorkouts.length > 0) {
          const { data: insertedWorkouts, error: insertError } = await supabase
            .from('workouts')
            .insert(newWorkouts.map(workout => ({
              id: workout.id,
              wager_id: wager.wager_id,
              type: workout.activityName,
              date: today,
              user_id: user.id,
              duration: Math.round((new Date(workout.end).getTime() - new Date(workout.start).getTime()) / (1000 * 60)), // Duration in seconds
              calories: Math.round(workout.calories || 0)
            })))
            .select();
  
          if (insertError) throw insertError;
  
          // Combine existing and new workouts
          const allWorkouts = [...supabaseWorkouts, ...insertedWorkouts];

          console.log('All workouts:', allWorkouts);
  
          // Update local state with all workouts
          if (isSubscribed) {
            setWorkoutEntries(allWorkouts);
          }
        } else {
          // If no new workouts, just use the Supabase workouts
          if (isSubscribed) {
            setWorkoutEntries(supabaseWorkouts);
          }
        }
  
      } catch (error) {
        console.error('Error in fetchAndUpdateWorkouts:', error);
      }
    };
  
    if (wager.wager_id && user) {
      fetchAndUpdateWorkouts();
    }
  
    return () => {
      isSubscribed = false;
      abortController.abort();
    };
  }, [wager.wager_id, user, isFocused]);


  async function storePushToken(userId, token) {
    const supabase = supabaseClient(await getToken({ template: 'supabase' }));
    const { error } = await supabase
      .from('profiles')
      .upsert(
        { user_id: userId, push_token: token },
        { onConflict: 'user_id' }
      );
  
    if (error) {
      console.error('Error storing push token:', error);
    }
  }

  useEffect(() => {
    let isSubscribed = true;
  
    const setupPushNotifications = async () => {
      if (user) {
        const token = await registerForPushNotificationsAsync();
        if (isSubscribed && token) {
          setPushToken(token);
          await storePushToken(user.id, token);
        }
      }
    };
  
    setupPushNotifications();
  
    return () => {
      isSubscribed = false;
    };
  }, [user]);


  if (loading) {
    return (
      <View style={{ backgroundColor: "#090909" }} className="flex-col h-full items-center justify-center ">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: "#090909" }} className="flex-col h-full items-center ">
      <View className='flex-col flex-1 w-full h-full justify-start items-center space-y-5'>
        {/* If there is an active wager, show the wager info */}
        <View className='flex-col flex-none w-full h-1/4 justify-center items-center border-b-2 border-neutral-900 bg-neutral-950'>
          <WagerInfo latest_wager={wager} hasActiveWager={hasActiveWager} />
        </View>
        <View className='flex-col flex-1 w-full justify-center items-center space-y-20'>
          {/* if there is an active wager, show Todays stats: status, pokes, use rest day*/}
          <View className='flex-col w-full h-2/5 justify-center items-center'>
            <TodayStatus wager_id={wager.wager_id} wager_status={wager.status} start_date={wager.start_date} selected_day={selectedDay} workouts={workoutEntries} workout_duration={wager.workout_duration}/>
          </View>

          {/* section for overall wager progress. 28 days, 4 check point, 7 days for each check point */}
          <View className='flex-col w-full h-1/3 items-center px-2'>
            <WagerCalendar start_date={wager.start_date} select_day={setSelectedDay} selected_day={selectedDay} last_completed_day={wager.last_date_completed} />
          </View>
        </View>
      </View>
    </View>
  );
};

export default Wager;
