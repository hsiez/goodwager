import { View, Text, Pressable, Modal, TouchableOpacity, ScrollView } from 'react-native';
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
//import Svg { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';



type CharityInfo = {
  name: string | null;
  url: string | null;
  type: string | null;
};


const WagerInfo = ({charity_id, amount, end_date}: {charity_id: string, amount: number, end_date: any }) => {
  const [endDateLong, setEndDateLong] = useState('');

  useEffect(() => {
    if (end_date != null) {
      var finish = new Date(end_date);
      setEndDateLong(`${finish.toLocaleString('default', { month: 'short' })} ${finish.getDate()}, ${finish.getFullYear()}`);
    }
  }, [end_date]);

  if (charity_id === null) {
    return (
      <View className='flex w-full items-start'>
        <View className='flex-col w-full justify-between mb-3 '>
          <View className='flex-row justify-start items-center space-x-1'>
            <Text style={{fontSize: 12}} className="text-neutral-500 font-semibold">NO ONGOING WAGER</Text>
          </View>
          
          
        </View>
        <View className="flex w-full justify-center items-center  mb-1">
          <Shadow startColor={'#050505'} distance={4} style={{borderRadius: 12}}>
            <View style={{backgroundColor: "#0D0D0D"}} className='flex-col border-neutral-800 rounded-xl border justify-center items-center'>
              <View className='flex-row w-full px-2 py-1 mb-2 justify-between items-center border-neutral-800 rounded-md border-b'>
                <Text style={{fontSize: 8}} className="text-neutral-200">Don't Be Shy</Text>
                <View className="flex-row space-x-1 h-3 w-fit justify-center items-center">
                  <View className="flex-col h-full justify-end items-end">
                    <Text style={{fontSize: 8}} className="text-neutral-300">Ante Up</Text>
                  </View>
                </View>
              </View>
              <View className="flex w-fit pt-2 justify-center items-center">
                <Text className="text-4xl text-white">${amount}</Text>
              </View>
              <View className="flex-row w-full space-x-2 mb-2 justify-center items-center">
              <View className='flex-row p-0.5'>
                <Link href="/wager/create" asChild>
                    <Pressable className='flex-row space-x-1 justify-center items-end'>
                      <Text style={{fontSize: 8}} className="text-neutral-100 ml-1 ">Create New Wager</Text>
                      <Ionicons name="create-outline" size={12} color="rgb(212 212 212)" />
                    </Pressable>
                  </Link>
              </View>
              </View>
            </View>
          </Shadow>
        </View>
      </View>
    )
  }
  const charity: CharityInfo = charity_map[charity_id];
  return (
    <View className='flex w-full items-start'>
      <View className='flex-col w-full justify-between mb-3 '>
        <View className='flex-row justify-start items-center space-x-1'>
          <Text style={{fontSize: 12}} className="text-emerald-400 font-semibold">ONGOING</Text>
          <Text style={{fontSize: 12}} className="text-white font-semibold">WAGER</Text>
        </View>
        
        
      </View>
      <View className="flex w-full justify-center items-center  mb-1">
        <Shadow startColor={'#050505'} distance={4} style={{borderRadius: 12}}>
          <View style={{backgroundColor: "#0D0D0D"}} className='flex-col border-neutral-800 rounded-xl border justify-center items-center'>
            <View className='flex-row w-full px-2 py-1 mb-2 justify-between items-center border-neutral-800 rounded-sm border-b'>
              <Text style={{fontSize: 10}} className="text-neutral-200">{charity.name}</Text>
              <View className="flex-row space-x-1 h-3 w-fit justify-center items-center">
                <FontAwesome6 name="flag-checkered" size={8} color={'rgb(115 115 115)'} />
                <View className="flex-col h-full justify-end items-end">
                  <Text style={{fontSize: 8}} className="text-neutral-300">{endDateLong}</Text>
                </View>
              </View>
            </View>
            <View className="flex w-fit pt-2 justify-center items-center">
              <Text className="text-4xl text-white">${amount}</Text>
            </View>
            <View className="flex-row w-full space-x-2 mb-2 justify-center items-center">
              <View className='flex-row p-0.5'>
                <Link href="/other" asChild>
                    <Pressable className='flex-row space-x-1 justify-center items-end'>
                      <Text style={{fontSize: 8}} className="text-neutral-600 ml-1 ">Manage Wager</Text>
                    </Pressable>
                  </Link>
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
  const [hasActiveWager, setHasActiveWager] = useState(false);
  const [wager, setWager] = useState({wager_id: null, user_id: null, start_date: null, end_date: null, ongoing: false, charity_id: null, amount: 0});
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const { user } = useUser();
  const tzone = Localization.getCalendars()[0].timeZone;

  useEffect(() => {
    let isSubscribed = true;
  
    const fetchWager = async () => {
      try {
        console.log(await TaskManager.getRegisteredTasksAsync())
        console.log(await SecureStore.getItemAsync('wager_id'))
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

  
        let { data, error } = await supabase
          .from('wagers')
          .select()
          .eq('ongoing', true);
  
        if (error) {
          console.log('error fetching from supabase', error);
          throw error;
        }
        
        if (isSubscribed) {
          if (data.length > 0) {
            setWager(data[0]);
            setHasActiveWager(true);
  
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
  }, [user, getToken]);
  console.log('wager', wager);


  return (
    <View style={{backgroundColor: "#090909"}} className="flex-col h-full items-center ">
      <View className='flex-col w-full px-5 h-full py-10 justify-between items-center'>
        {/* If there is an active wager, show the wager info */}
        <WagerInfo charity_id={wager.charity_id} amount={wager.amount} end_date={wager.end_date} /> 
 
        {/* if there is an active wager, show Todays stats: status, pokes, use rest day*/}
        <View className='flex-col w-full h-1/4 justify-center items-center'>
          <View className='flex w-full items-start mb-4'>
            <Text  style={{fontSize: 12}} className="text-white font-semibold">TODAY</Text>
          </View>
          <TodayStatus wager_id={wager.wager_id} start_date={wager.start_date}/>
        </View>

        {/* section for overall wager progress. 28 days, 4 check point, 7 days for each check point */}
        <View className='flex-col w-full h-1/4 justify-center items-center'>
          <View className='flex w-full items-start mb-4'>
            <Text style={{fontSize: 12}} className="text-white font-semibold">TRACKER</Text>
          </View>
          <WagerCalendar wagerId={wager.wager_id} start_date={wager.start_date} />
        </View>
      </View>

    </View>
  );
};

export default Wager;
