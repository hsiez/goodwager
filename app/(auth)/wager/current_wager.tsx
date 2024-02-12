import { View, Text, Pressable, Modal, TouchableOpacity, ScrollView } from 'react-native';
import React, {useState, useContext, useEffect} from 'react';
import { useUser, useAuth } from '@clerk/clerk-expo';
import CurrentWager from '../../components/current-wager-status';
import WorkoutTable from '../../components/wager-progress';
import * as Localization from 'expo-localization';
import { Link } from "expo-router";
import CurrentWorkoutStatus from '../../components/workout-status';
import supabaseClient from '../../utils/supabase';
import * as TaskManager from 'expo-task-manager';
import * as SecureStore from 'expo-secure-store';


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
    <View className="h-full bg-neutral-900">
      <View className='flex justify-center items-center'>
        <View className="justify-start mt-20">
          <Text className="text-3xl text-gray-100 mb-20"> Welcome, Harley</Text>
        </View>

        {/* Current Wager */}
        <CurrentWager wager={wager} />
        <ManageWager activeWager={hasActiveWager} />
      </View>

      {/* section for overall wager progress. 28 days, 4 check point, 7 days for each check point */}
      <View className="flex-1 items-center bg-neutral-900">
        <WorkoutTable />
      </View>

    </View>
  );
};

export default Wager;
