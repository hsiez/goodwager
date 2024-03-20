import { View, Text, Pressable, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import React, {useState, useContext, useEffect} from 'react';
import { useUser, useAuth } from '@clerk/clerk-expo';
import TodayStatus from '../../components/today_status';
import WagerCalendar from '../../components/wager_calendar';
import * as Localization from 'expo-localization';
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
//import Svg { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';



type CharityInfo = {
  name: string | null;
  url: string | null;
  type: string | null;
};


const WagerInfo = ({latest_wager}: {latest_wager: any}) => {
  const [hasActiveWager, setHasActiveWager] = useState(false);
  const [amount, setAmount] = useState(0);
  const [statusTitle, setStatusTitle] = useState('NO ONGOING WAGER');
  const [statusTitleColor, setStatusTitleColor] = useState('text-neutral-500');
  const [bannerLeft, setBannerLeft] = useState('Don\'t Be Shy');
  const [bannerRight, setBannerRight] = useState('Ante Up');


  const WagerButton = () => {
    if (!hasActiveWager) {
      return (
        <Link href="/wager/create" asChild>
          <Pressable className='flex-row space-x-1 justify-center items-end'>
            <Text style={{fontSize: 8}} className="text-neutral-100 ml-1 ">Create New Wager</Text>
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
        setStatusTitle('ONGOING WAGER');
        setHasActiveWager(true);
        setStatusTitleColor('text-emerald-500');
      }
      if (latest_wager.status === 'completed') {
        setStatusTitle('COMPLETED WAGER');
        setStatusTitleColor('text-emerald-500');
      }
      if (latest_wager.status === 'failed') {
        setStatusTitle('FAILED WAGER');
        setStatusTitleColor('text-rose-400');
      }
      setBannerLeft(charity_map[latest_wager.charity_id].name);
      var finish = new Date(latest_wager.end_date);
      setBannerRight(`${finish.toLocaleString('default', { month: 'short' })} ${finish.getDate()}, ${finish.getFullYear()}`);
      setAmount(latest_wager.amount);
    }
    if (latest_wager != null) {
      
    }
  }, [latest_wager]);
  
  return (
    <View className='flex w-full items-start'>
      <View className='flex-col w-full justify-between mb-3 '>
        <View className='flex-row justify-start items-center space-x-1'>
          <Text style={{fontSize: 12}} className={`${statusTitleColor} font-semibold`}>{statusTitle}</Text>
        </View>
        
        
      </View>
      <View className="flex w-full justify-center items-center  mb-1">
        <Shadow startColor={'#050505'} distance={4} style={{borderRadius: 12}}>
          <View style={{backgroundColor: "#0D0D0D"}} className='flex-col border-neutral-800 rounded-xl border justify-center items-center'>
            <View className='flex-row w-full px-2 py-1 mb-2 justify-between items-center border-neutral-800 rounded-sm border-b'>
              <Text style={{fontSize: 8}} className="text-neutral-200">{bannerLeft}</Text>
              <View className="flex-row space-x-1 h-3 w-fit justify-center items-center">
                {latest_wager.wager_id != null && <FontAwesome6 name="flag-checkered" size={8} color={'rgb(115 115 115)'} />}
                <View className="flex-col h-full justify-end items-end">
                  <Text style={{fontSize: 8}} className="text-neutral-300">{bannerRight}</Text>
                </View>
              </View>
            </View>
            <View className="flex w-fit pt-2 justify-center items-center">
              <Text className="text-4xl text-white">${amount}</Text>
            </View>
            <View className="flex-row w-full space-x-2 mb-2 justify-center items-center">
              <View className='flex-row p-0.5'>
                <WagerButton />
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
  const tzone = Localization.getCalendars()[0].timeZone;
  const [workedoutToday, setWorkedoutToday] = useState(false);

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
      .update({ last_date_completed: today, streak: wager.streak + 1 })
      .eq('wager_id', wager.wager_id);
      if (error) {
          console.log('error updating last_date_completed', error);
          throw error;
      }
      setWager({...wager, last_date_completed: today, streak: wager.streak + 1});
  }

  useEffect(() => {
    let isSubscribed = true;
  
    const fetchWager = async () => {
      try {
        console.log('fetching wager');
        console.log(await getToken());
        let supabaseAccessToken: string | null = null;
        try {
          supabaseAccessToken = await getToken({ template: 'supabase' });
        } catch (error) {
          console.error('Error fetching Supabase token:', error);
          supabaseAccessToken = null;
        }
        // Assuming supabaseClient is correctly initialized and can accept the token.
        
        const supabase = supabaseClient(supabaseAccessToken);

  
        let { data, error } = await supabase
          .from('wagers')
          .select()
          .eq('user_id', user.id)
          .eq('status', 'ongoing');
        if (error) {
          console.log('error fetching wager data from supabase', error);
          throw error;
        }
        
        if (isSubscribed) {
          const today = new Date(new Date().setHours(0, 0, 0, 0));
          if (data.length > 0) {
            const last_date_completed = new Date(data[0].last_date_completed);
             // Check if last complete day is less then 2 days ago
            
            if ((today.getTime() - last_date_completed.getTime()) < 172800000 || data[0].last_date_completed === null) {
              setWager(data[0]);
              setHasActiveWager(true);
            }
            else {
              setHasActiveWager(false);
              const { error } = await supabase
                .from('wagers')
                .update(
                    { status: 'failed' },
                )
                .eq('wager_id', data[0].wager_id);
              if (error) {
                console.log('error updating wager status to \'failed \'', error);
              }
            }
          }

          if (hasActiveWager) {
            if (new Date(wager.last_date_completed) === today) {
              console.log('Workout already logged for today');
              setWorkedoutToday(true);
            }
            else {
              handleHealthData(today.toISOString());
              if (workedoutToday) {
                updateWagerWithWorkout(today.toISOString());
                const tracker = JSON.parse(await SecureStore.getItemAsync("wager_tracker"));
                tracker[today.toISOString()].workedOut = true;
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


  return (
    <View style={{backgroundColor: "#090909"}} className="flex-col h-full items-center ">
      <View className='flex-col w-full px-5 h-full py-10 justify-between items-center '>
        {/* If there is an active wager, show the wager info */}
        <WagerInfo latest_wager={wager} /> 
 
        {/* if there is an active wager, show Todays stats: status, pokes, use rest day*/}
        <View className='flex-col w-full h-1/4 justify-center items-center'>
          <View className='flex w-full items-start mb-4'>
            <Text  style={{fontSize: 12}} className="text-white font-semibold">TODAY</Text>
          </View>
          <TodayStatus start_date={wager.start_date}  worked_out_today={workedoutToday}/>
        </View>

        {/* section for overall wager progress. 28 days, 4 check point, 7 days for each check point */}
        <View className='flex-col w-full h-1/4 justify-center items-center'>
          <View className='flex w-full items-start mb-4'>
            <Text style={{fontSize: 12}} className="text-white font-semibold">TRACKER</Text>
          </View>
          <WagerCalendar last_date_completed={wager.last_date_completed} start_date={wager.start_date} />
        </View>
      </View>

    </View>
  );
};

export default Wager;
