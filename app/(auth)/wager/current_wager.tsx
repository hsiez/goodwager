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
//import Svg { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';



type CharityInfo = {
  name: string | null;
  url: string | null;
  type: string | null;
};


const WagerInfo = ({charity_id, amount, end_date}: {charity_id: string, amount: number, end_date: any }) => {
  if (charity_id === null) {
    return (
      <View className='flex w-full justify-center '>
        <View className='flex-row w-full justify-between'>
          <Text className="text-xl text-white">On the Line </Text>
          <Text className="text-2xl text-white">$0</Text>
        </View>
        
        <View className='flex-row w-full justify-between'>
          <View className='flex-row space-x-1 mb-1'>
            <Text className="text-xs font-bold text-rose-500"> NO</Text>
            <Text className="text-xs text-neutral-600">ACTIVE WAGER</Text>
          </View>
          <View className='flex h-6 w-28'>
            <Shadow startColor={'#050505'} paintInside={true} distance={6} style={{borderRadius: 10, flexDirection: "row", width: '100%', height:"100%" }}>
                    <View style={{backgroundColor: "#0D0D0D"}} className="flex h-full border border-neutral-400 bg-neutral-700 rounded-lg w-full justify-center items-center">
                        <View className='h-full w-full flex-col justify-between items-center'>
                          <Link href="/wager/create" asChild>
                            <Pressable className='flex items-center justify-center'>
                              <Text className='text-white text-sm text-center'>Create Wager</Text>
                            </Pressable>
                          </Link>
                        </View>
                    </View>
                </Shadow>
          </View>
        </View>
      </View>
    )
  }
  const charity: CharityInfo = charity_map[charity_id];
  return (
    <View className='flex w-full items-start'>
      <View className='flex-row space-x-1 mb-1'>
        <Text className="text-xs text-emerald-400">ACTIVE</Text>
        <Text className="text-xs text-white">WAGER</Text>
      </View>
      <View className="flex-row w-full justify-between mb-1">
        <Text className="text-3xl text-white">{charity.name}</Text>
        <Text className="text-4xl text-white">{amount}</Text>
      </View>
      <View className="flex-row w-full justify-between">
        <Text className="text-xs text-white">{end_date}</Text>
        <Link href="/other" asChild>
          <Pressable className='flex w-20 h-6 items-center rounded border-2 border-slate-500'>
            <Text className='text-white text-sm text-center'>Manage</Text>
          </Pressable>
        </Link>
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
  const [wager, setWager] = useState({id: null, user_id: null, start_date: null, end_date: null, ongoing: false, charity_id: null, amount: 0});
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
    <View style={{backgroundColor: "#080808"}} className="flex-col h-full items-center ">
      <View className='flex-col w-full px-5 h-full py-10 justify-between items-center'>
        {/* If there is an active wager, show the wager info */}
        <WagerInfo charity_id={wager.charity_id} amount={wager.amount} end_date={wager.end_date} /> 
 
        {/* if there is an active wager, show Todays stats: status, pokes, use rest day*/}
        <TodayStatus wager_id={wager.id} start_date={wager.start_date}/>

        {/* section for overall wager progress. 28 days, 4 check point, 7 days for each check point */}
        <WagerCalendar wagerId={wager.id} start_date={wager.start_date} />
      </View>

    </View>
  );
};

export default Wager;
