import { View, Text, Pressable, Modal, TouchableOpacity, ScrollView } from 'react-native';
import React, {useState, useContext, useEffect} from 'react';
import { useUser, useAuth } from '@clerk/clerk-expo';
import CurrentWager from '../../components/current-wager-status';
import WorkoutTable from '../../components/wager-progress';
import * as Localization from 'expo-localization';
import { Link } from "expo-router";
import supabaseClient from '../../utils/supabase';
import * as TaskManager from 'expo-task-manager';
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';
//import Svg { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';



type CharityInfo = {
  name: string;
  url: string;
  type: string;
};

type WagerData = {
  id: string;
  charity: CharityInfo;
  amount: number;
  end_date: string;
  ongoing: boolean;
};

const WagerInfo = ({wagerData}: {wagerData: WagerData | null}) => {
  if (wagerData === null) {

    return (
      <View className='flex w-full justify-center'>
        <View className='flex-row space-x-1 mb-1'>
          <Text className="text-xs font-bold text-rose-500"> NO</Text>
          <Text className="text-xs text-white">ACTIVE WAGER</Text>
        </View>
        <View className='flex-row w-full justify-between'>
          <Text className="text-xl text-white">On the Line </Text>
          <Text className="text-2xl text-white">$0</Text>
        </View>
        <View className='flex mt-4 w-full items-center justify-center'>
          <Link href="/other" asChild>
            <Pressable className='flex w-64 h-8 items-center justify-center rounded-full border-2 border-slate-500'>
              <Text className='text-white text-lg text-center'>Create New Wager</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    )
  }

  return (
    <View className='flex w-full items-start'>
      <View className='flex-row space-x-1 mb-1'>
        <Text className="text-xs text-emerald-400">ACTIVE</Text>
        <Text className="text-xs text-white">WAGER</Text>
      </View>
      <View className="flex-row w-full justify-between mb-1">
        <Text className="text-3xl text-white">Samaritan</Text>
        <Text className="text-4xl text-white">$20</Text>
      </View>
      <View className="flex-row w-full justify-between">
        <Text className="text-xs text-white">ENDS: 01/23/24</Text>
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
  const [wager, setWager] = useState(null);
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
          .select('*')
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
        <WagerInfo wagerData={wager} />
 
        {/* if there is an active wager, show Todays stats: status, pokes, use rest day*/}
        <CurrentWager wager={wager} />

        {/* section for overall wager progress. 28 days, 4 check point, 7 days for each check point */}
        <WorkoutTable wagerId={null} />
      </View>

    </View>
  );
};

export default Wager;
