import { View, Text, Pressable, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import React, { useState, useContext, useEffect, useLayoutEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-expo';
import TodayStatus from '../../components/today_status';
import WagerCalendar from '../../components/wager_calendar';
import { Link } from "expo-router";
import supabaseClient from '../../utils/supabase';
import * as SecureStore from 'expo-secure-store';
import charity_map from '../../utils/charity_map';
import { Shadow } from 'react-native-shadow-2';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import HealthKitContext from '../../components/HealthkitContext';
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { Activities } from '../../utils/activity_map';
import CornerBorder from '../../components/corner_border';

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
        className='flex-row px-2 py-1 justify-start items-center rounded-md bg-neutral-500'
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
  const [workoutFreq, setWorkoutFreq] = useState(0);
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
      setWorkoutFreq(latest_wager.workout_freq);
    }
  }, [latest_wager, hasActiveWager]);

  return (
    <View className='flex w-full items-center'>
      <View style={{ height: 103 }} className="flex w-full justify-center items-center mt-10">
        <View className='flex-col min-w-full px-3 rounded-2xl justify-center items-center space-y-6 '>
          <View className="flex-row pl-0.5 w-full justify-start items-center mt-1 space-x-2 ">
            <View className='rounded'>
              <Text className="text-3xl text-neutral-700">${amount}</Text>
            </View>
            <Ionicons name="arrow-forward-outline" size={20} color="#404040" />
            {hasActiveWager ?
              <View className=''>
                <Text className="text-2xl text-neutral-700">{charity_map[latest_wager.charity_id].name}</Text>
              </View>
              :
              <View className='px-2 border-dashed border border-neutral-800 rounded-xl'>
                <Text className="text-2xl text-neutral-800">your fav charity</Text>
              </View>
            }
          </View>
          <View className="flex-row w-full space-x-2 mb-2 justify-center items-center">
            <View className='flex-row w-full justify-between items-center' >
              <View className='flex-row px-2 py-1 space-x-2 justify-center items-start rounded-3xl bg-neutral-800'>
                <FontAwesome6 name="flag" size={10} color={'#00ff00'} />
                <Text style={{ fontSize: 10 }} className="text-neutral-400 ml-1 ">{start}</Text>
              </View>
              <View className='flex-row px-2 py-1 space-x-2 justify-center items-start bg-neutral-800 rounded-3xl'>
                <FontAwesome6 name="flag-checkered" size={10} color={'#e5e5e5'} />
                <Text style={{ fontSize: 10 }} className="text-neutral-400 ml-1 ">{end}</Text>
              </View>
              <View className='flex-row px-2 py-1 justify-center items-center bg-neutral-800 rounded-3xl'>
                <Text style={{ fontSize: 10 }} className="text-neutral-400 ml-1 ">{workoutFreq} workouts weekly</Text>
              </View>
              {hasActiveWager ?
                <View className='flex-row px-3 py-1 justify-center items-center bg-neutral-400 rounded'>
                  <FontAwesome6 name="edit" size={11} color={'#404040'} />
                </View>
                :
                <ShimmerButton title={"create wager"} onPress={() => { }} />
              }
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}


const Wager = () => {
  const isFocused = useIsFocused();
  const [hasActiveWager, setHasActiveWager] = useState(false);
  const [wager, setWager] = useState({ wager_id: null, user_id: null, start_date: null, end_date: null, status: null, charity_id: null, amount: 0, last_date_completed: null, streak: 0 });
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const { user } = useUser();
  const { healthKitAvailable, AppleHealthKit } = useContext(HealthKitContext);
  const [possible_workout, set_possible_workout] = useState(null);
  const [selectedDay, setSelectedDay] = useState(new Date(new Date().setHours(0, 0, 0, 0)).toISOString());
  const [workoutEntries, setWorkoutEntries] = useState([]);

  function handleHealthData(date: string) {
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
            return;
          }
          if (results.length > 0) {
            console.log('Workout found', results);
            set_possible_workout({ start_date: results[0].start_date, end_date: results[0].end_date, calories: results[0].calories, activityName: results[0].activityName });
          }
        }
      );
    }
  }

  async function updateWagerWithWorkout(today) {
    console.log('updating workout table with new workout', wager);
    const supabase = supabaseClient(await getToken({ template: 'supabase' }));

    const workout_duration_minutes = Math.floor((new Date(possible_workout.end_date).getTime() - new Date(possible_workout.start_date).getTime()) / (1000 * 60));
    const activity = Activities[possible_workout.activityName]
    const { error } = await supabase
      .from('workouts')
      .insert({ user_id: user.id, wager_id: wager.wager_id, date: today, calories: Math.floor(Number(possible_workout.calories)), type: activity, duration: workout_duration_minutes })
    if (error) {
      console.log('error storing new workout', error);
      throw error;
    }
    setWager(prevWager => ({
      ...prevWager,
      last_date_completed: today
    }));
    const challengeDay = Math.floor((new Date(today).getTime() - new Date(wager.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;

  }

  useEffect(() => {
    let isSubscribed = true;
    setLoading(true);

    const fetchWager = async () => {
      try {
        console.log('fetching wager');
        let supabaseAccessToken: string | null = null;
        try {
          supabaseAccessToken = await getToken({ template: 'supabase' });
        } catch (error) {
          console.error('Error fetching Supabase token:', error);
          supabaseAccessToken = null;
        }
        // Assuming supabaseClient is correctly initialized and can accept the token.

        const supabase = supabaseClient(supabaseAccessToken);

        const { data, error } = await supabase
          .from('wagers')
          .select()
          .eq('user_id', user.id)
          .eq('status', 'ongoing');
        if (error) {
          console.log('error fetching wager data from supabase', error);
          throw error;
        }
        if (isSubscribed) {
          const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
          if (data.length > 0) {
            setHasActiveWager(true);
            setWager(data[0]);

            if (data[0].last_date_completed !== today) {
              console.log('Looking for workout data for today');
              handleHealthData(today);
            }
          }

          // Get all the workouts for the current wager
          const { data: workoutData, error: workoutError } = await supabase
            .from('workouts')
            .select()
            .eq('wager_id', data[0].wager_id)
            .eq('user_id', user.id)
            .order('date', { ascending: true });
          if (workoutError) {
            console.log('Error fetching workouts:', workoutError);
            return;
          }
          setWorkoutEntries(workoutData);
        }
      } catch (error) {
        console.error('An error occurred while fetching the wager:', error as string);
        if (isSubscribed) {
          setLoading(false);
        }
        // Handle error state as needed, e.g. show a message to the user
      }
      setLoading(false);
    };

    if (user) {
      fetchWager();
    }

    return () => {
      isSubscribed = false; // Clean up subscription on unmount
    };
  }, [user, getToken, isFocused, possible_workout]);

  useEffect(() => {
    const updateWorkout = async () => {
      if (possible_workout != null) {
        const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
        await updateWagerWithWorkout(today);
      }
    };

    if (possible_workout != null) {
      updateWorkout();
    }
  }, [possible_workout, getToken, user, wager.wager_id]);

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
        <View className='flex-col flex-none w-full h-1/4 justify-center items-center bg-neutral-300'>
          <WagerInfo latest_wager={wager} hasActiveWager={hasActiveWager} />
        </View>
        <View className='flex-col flex-1 w-full justify-center items-center space-y-20'>
          {/* if there is an active wager, show Todays stats: status, pokes, use rest day*/}
          <View className='flex-col w-full h-2/5 justify-center items-center'>
            <TodayStatus start_date={wager.start_date} selected_day={selectedDay} workouts={workoutEntries}/>
          </View>

          {/* section for overall wager progress. 28 days, 4 check point, 7 days for each check point */}
          <View className='flex-col w-full h-1/3 items-center px-2'>
            <WagerCalendar last_date_completed={wager.last_date_completed} start_date={wager.start_date} select_day={setSelectedDay} selected_day={selectedDay} workouts={workoutEntries} />
          </View>
        </View>
      </View>
    </View>
  );
};

export default Wager;
