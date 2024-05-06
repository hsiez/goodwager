import { View, Text, Pressable, Modal, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import React, {useState, useContext, useEffect} from 'react';
import { useUser, useAuth } from '@clerk/clerk-expo';
import TodayStatus from '../../components/today_status';
import WagerCalendar from '../../components/wager_calendar';
import { Link } from "expo-router";
import supabaseClient from '../../utils/supabase';
import * as TaskManager from 'expo-task-manager';
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';
import charity_map from '../../utils/charity_map';
import { Shadow } from 'react-native-shadow-2';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import HealthKitContext from '../../components/HealthkitContext';
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
//import Svg { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';s


const ShimmerButton = ({ title, onPress }) => {
  const [isShimmering, setIsShimmering] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsShimmering((prevState) => !prevState);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <TouchableOpacity
      onPress={onPress}
      className='flex-row  px-2 py-1 justify-start items-center rounded-3xl bg-neutral-500'
    >
      <Text style={{fontSize: 8}} className="text-neutral-950 mr-2">{title}</Text>
      <FontAwesome6 name="edit" size={8} color={'#0a0a0a'} />
      <ShimmerPlaceholder
        visible={false}
        style={
          {
            width: "auto",
            height: "auto",
            borderRadius: 12,
          }
        
        }
        shimmerStyle={{
          backgroundColor: 'rgb(0, 0, 0, 0)',
          position: 'absolute',
          opacity:0.3,
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
  );
};




const WagerInfo = ({latest_wager, hasActiveWager}: {latest_wager: any, hasActiveWager: boolean}) => {
  const [amount, setAmount] = useState(0);
  const [statusTitle, setStatusTitle] = useState('No');
  const [statusTitleColor, setStatusTitleColor] = useState('text-neutral-500');
  const [workoutFreq, setWorkoutFreq] = useState(0);
  const [start, setStart] = useState('TBT');
  const [end, setEnd] = useState('TBT');


  const WagerButton = () => {
    if (!hasActiveWager) {
      return (
        <Link href="/wager/create" asChild>
          <Pressable className='flex-row space-x-1 justify-center items-end'>
            <Text style={{fontSize: 8}} className="text-neutral-100 ">Create New Wager</Text>
            <Ionicons name="create-outline" size={12} color="rgb(212 212 212)" />
          </Pressable>
        </Link>
      );
    } else {
      return (
        <Link href="/other" asChild>
          <Pressable className='flex-row space-x-1 justify-center items-end'>
            <Text style={{fontSize: 8}} className="text-neutral-500 ml-1 ">Manage Wager</Text>
            <Ionicons name="pencil-outline" size={12} color="rgb(212 212 212)" />
          </Pressable>
        </Link>
      );
    }
  }
  useEffect(() => {
    if (latest_wager.wager_id != null) {
      if (latest_wager.status === 'ongoing') {
        setStatusTitle('Active');
        setStatusTitleColor('text-green-500');
      }
      if (latest_wager.status === 'completed') {
        setStatusTitle('COMPLETED WAGER');
        setStatusTitleColor('text-emerald-500');
      }
      if (latest_wager.status === 'failed') {
        setStatusTitle('FAILED WAGER');
        setStatusTitleColor('text-rose-400');
      }
      setStart(new Date(latest_wager.start_date).toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric'}));
      setEnd(new Date(latest_wager.end_date).toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric'}));
      setAmount(latest_wager.amount);
      setWorkoutFreq(latest_wager.workout_freq);
    }
    if (latest_wager != null) {
      
    }
  }, [latest_wager, hasActiveWager]);
  
  return (
    <View className='flex w-full items-start'>
      <View className='flex-col w-full justify-between mb-2 '>
        <View className='flex-row justify-start items-center space-x-1'>
          <Text style={{fontSize: 12}} className={`${statusTitleColor} font-semibold`}>{statusTitle}</Text>
          <Text style={{fontSize: 12}} className={`text-neutral-200 font-semibold`}>Wager</Text>
        </View>
      </View>
      <View style={{height: 103}} className="flex w-full justify-center items-center mb-1">
        <Shadow startColor={'#050505'} distance={2} style={{borderRadius: 12}}>
          <View className='flex-col min-w-full px-2 rounded-2xl justify-center items-center border border-neutral-600 space-y-2 pt-2'>
            <View className="flex-row pl-0.5 w-full justify-start items-center mt-1 space-x-2 ">
              <View className='rounded'>
                <Text className="text-2xl text-neutral-200">${amount}</Text>
              </View>
              <Ionicons name="arrow-forward-outline" size={20} color="#404040" />
              {hasActiveWager ?
              <View className='p-2'>
                <Text className="text-2xl text-neutral-200">{charity_map[latest_wager.charity_id].name}</Text>
              </View>
              :
              <View className='px-2 border-dashed border border-neutral-800 rounded-xl'>
                <Text className="text-lg text-neutral-800">your fav charity</Text>
              </View>
              }
            </View>
            <View className="flex-row w-full space-x-2 mb-2 justify-center items-center">
              {/*}
              <View className='flex-row p-0.5'>
                <WagerButton />
              </View>
              */}
              <View className='flex-row w-full justify-between items-center' >
                <View className='flex-row px-2 py-1 space-x-2 justify-center items-start rounded-3xl bg-neutral-900'>
                  <FontAwesome6 name="flag" size={8} color={'#00ff00'} />
                  <Text style={{fontSize: 8}} className="text-neutral-500 ml-1 ">{start}</Text>
                </View>
                <View className='flex-row px-2 py-1 space-x-2 justify-center items-start  bg-neutral-900 rounded-3xl'>
                  <FontAwesome6 name="flag-checkered" size={8} color={'#e5e5e5'} />
                  <Text style={{fontSize: 8}} className="text-neutral-500 ml-1 ">{end}</Text>
                </View>
                <View className='flex-row px-2 py-1 justify-center items-center bg-neutral-900 rounded-3xl'>
                  <Text style={{fontSize: 8}} className="text-neutral-500 ml-1 ">{workoutFreq} workouts weekly</Text>
                </View>
                {hasActiveWager ?
                <View className='flex-row px-3 py-1 justify-center items-center bg-neutral-400 rounded-3xl'>
                  <FontAwesome6 name="edit" size={11} color={'#404040'} />
                </View>
                :
                <ShimmerButton title={"Create new wager"} onPress={() => {}}/>
                }
              </View>
            </View>
          </View>
        </Shadow>
      </View>
      
      
    </View>
  );
}

const ManageWager = ({ activeWager }: { activeWager: boolean }) => {
  if (activeWager) {
    return (
      <Link href="/other" asChild>
              <Pressable>
                <Text>Manage Wager</Text>
              </Pressable>
      </Link>
    );
  } else {
    return (
      <Link push href="wager/create" asChild>
                <Pressable className='bg-zinc-700 rounded-md border-2 pr-4 pl-4 pt-2 pb-2'>
                  <Text className='text-white'>Create Wager</Text>
                </Pressable>
        </Link>
    );
  }
}

const Wager = () => {
  const isFocused = useIsFocused();
  const [hasActiveWager, setHasActiveWager] = useState(false);
  const [wager, setWager] = useState({wager_id: null, user_id: null, start_date: null, end_date: null, status: null, charity_id: null, amount: 0, last_date_completed: null, streak: 0});
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const { user } = useUser();
  const { healthKitAvailable, AppleHealthKit } = useContext(HealthKitContext);
  const [possible_workout, set_possible_workout] = useState(null);

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
                      set_possible_workout(results[0]);
                  }
              }
          );
      }
  }

  const worked_out_today = async() => {
    const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString(); 
    const last_day = await SecureStore.getItemAsync("last_day");
    if (last_day === today) {
      return true;
    }
  }
  async function updateWagerWithWorkout(today) {
      console.log('updating workout table with new workout', wager);
      const supabase = supabaseClient(await getToken({ template: 'supabase' }));
      const { error } = await supabase
      .from('workouts')
      .insert({ wager_id: wager.wager_id, date: today, calories: possible_workout.calories, type: possible_workout.activityName})
      if (error) {
          console.log('error storing new workout', error);
          throw error;
      }
      wager.last_date_completed = today;
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

          }

          if (hasActiveWager) {
            console.log("dates", wager.last_date_completed, today)
            if (wager.last_date_completed != today) {
              console.log('Looking for workout data for today');
              handleHealthData(today);
              if (possible_workout != null) {
                updateWagerWithWorkout(today);
                const tracker = JSON.parse(await SecureStore.getItemAsync("wager_tracker"));
                tracker[today].workedOut = true;
                await SecureStore.setItemAsync("wager_tracker", JSON.stringify(tracker));
              }
            }
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('An error occurred while fetching the wager:', error as string);
        if (isSubscribed) {
          setLoading(false);
        }
        // Handle error state as needed, e.g. show a message to the user
      }
    };
  
    if (user) {
      fetchWager();
    }
  
    return () => {
      isSubscribed = false; // Clean up subscription on unmount
    };
  }, [user, getToken, isFocused]);


  if (loading) {
    return (
      <View style={{backgroundColor: "#090909"}} className="flex-col h-full items-center ">
        <View className='flex-col w-full px-5 h-full py-10 justify-between items-center '>

          {/* wager info loading box */}
          <View className='flex min-w-full items-start'>
            <View style={{height: 14, width:"100%"}} className='flex-col justify-between mb-3 '/>
            <View className="flex w-full justify-center items-center  mb-1">
              <Shadow startColor={'#050505'} distance={4} style={{borderRadius: 12}}>
                <View style={{height:103, backgroundColor: "#0D0D0D"}} className='flex-col min-w-full border-neutral-800 rounded-xl border justify-center items-center'>
                </View>
              </Shadow>
            </View>
          </View>
  
          {/* today status loading box*/}
          <View className='flex-col w-full h-1/4 justify-center items-center'>
            <View style={{height: 14}} className='flex w-full items-start mb-4'/>
            <View  className='flex w-3/5 rounded-xl'>
              <Shadow startColor={'#050505'} paintInside={true} distance={4} style={{borderRadius: 12}}>
                <View style={{backgroundColor: "#0D0D0D"}} className="flex h-full min-w-full justify-center items-center border-neutral-800 rounded-xl border"/>
              </Shadow>
            </View>
          </View>

          {/* section for overall wager progress. 28 days, 4 check point, 7 days for each check point */}
          <View className='flex-col w-full h-1/4 justify-center items-center'>
            <View style={{height: 14}} className='flex w-full items-start mb-4'/>
            <Shadow startColor={'#050505'} distance={4} style={{borderRadius: 10, flexDirection: "row", width: '100%', height:"100%" }}>
              <View  style={{backgroundColor: "#090909"}} className="flex-col h-full min-w-full justify-between items-center p-3 border rounded-xl border-neutral-800"/>
            </Shadow>
          </View>
        </View>
    </View>
    );
  }
  return (
    <View style={{backgroundColor: "#090909"}} className="flex-col h-full items-center ">
      <View className='flex-col w-full px-5 h-full py-10 justify-between items-center '>
        {/* If there is an active wager, show the wager info */}
        <WagerInfo latest_wager={wager} hasActiveWager={hasActiveWager}/> 
 
        {/* if there is an active wager, show Todays stats: status, pokes, use rest day*/}
        <View className='flex-col w-full h-1/4 justify-center items-center'>
          <View className='flex w-full items-start mb-4'>
            <Text  style={{fontSize: 12}} className="text-white font-semibold">Today</Text>
          </View>
          <TodayStatus start_date={wager.start_date}  worked_out_today={possible_workout != null}/>
        </View>

        {/* section for overall wager progress. 28 days, 4 check point, 7 days for each check point */}
        <View className='flex-col w-full h-1/4 justify-center items-center'>
          <WagerCalendar last_date_completed={wager.last_date_completed} start_date={wager.start_date} />
        </View>
      </View>

    </View>
  );
};

export default Wager;
