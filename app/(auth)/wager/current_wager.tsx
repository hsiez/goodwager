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
import Svg, { Circle, Defs, Stop, RadialGradient } from 'react-native-svg';


type CharityInfo = {
  name: string;
  url: string;
  type: string;
};
const CharityInfo = ({charityInfo}: {charityInfo: CharityInfo | null}) => {
  if (charityInfo == null) {

    return (
      <View className="flex-col justify-between items-start">
        <View>
          <View className="flex-col w-full justify-between items-start pb-1">
            <Text className="text-xs text-white"></Text>
            <Text className="text-3xl text-white">No Active Wager</Text>
            <View className="flex-row space-x-2">
              <Text className="text-xs font-mono text-rose-600">Make one, don't be shy!</Text>
            </View>
          </View>
        </View>
      </View>
    )
}

  return (
    <View className="flex-col w-full justify-between items-start">
      <View>
        <View className="flex-col w-full justify-between items-start pb-1">
          <Text className="text-xs text-white">charityInfo.type</Text>
          <Text className="text-3xl text-white">{charityInfo.name}</Text>
          <Pressable className="flex-row space-x-2" onPress={() => Linking.openURL(charityInfo.url)}>
            <Text className="text-xs font-mono text-rose-600">Learn more</Text>
            <Text className="text-xs font-mono text-white">{charityInfo.url}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const WagerAmountInfo = ({wagerAmount}: {wagerAmount: number}) => {
  return (
    <View className="flex-row mt-4 justify-between items-center pb-2">
      <View className="flex items-start">
        <Text className="text-5xl text-white text-start">{`$${wagerAmount !== null ? wagerAmount : 0}`}</Text>
      </View>
      <View className="flex-row space-x-3">
        
      </View>
    </View>
  )
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
    <View className="flex-col h-full items-center bg-neutral-900">
      <View className='flex w-4/5 h-full mt-20 mb-20 justify-between items-center'>
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
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Svg height="150" width="150">
              <Defs>
                <RadialGradient id="grad" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="gray" stopOpacity="1" />
                  <Stop offset="100%" stopColor="green" stopOpacity="1" />
                </RadialGradient>
              </Defs>
              <Circle cx="75" cy="75" r="75" fill="url(#grad)" />
            </Svg>
          </View>
        </View>

        {/* Today's workout status */}

        {/* section for overall wager progress. 28 days, 4 check point, 7 days for each check point */}
        <WorkoutTable />
      </View>

    </View>
  );
};

export default Wager;
