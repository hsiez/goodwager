import { ActivityIndicator, View } from 'react-native';
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import HealthKitContext from './components/HealthkitContext';
import { useContext, useState } from 'react';
import supabaseClient from './utils/supabase';
import * as SecureStore from 'expo-secure-store';
import { useAuth, useUser } from "@clerk/clerk-expo";


/*
interface AnchoredQueryResults {
    anchor: string
    data: Array<any>
}

// Use Device Storage to cache the last workout date sent to DB
const workoutCache = {
    async getLatestStoredWorkout(key: string) {
      try {
        return SecureStore.getItemAsync(key);
      } catch (err) {
        return null;
      }
    },
    async saveLatestStoredWorkout(key: string, value: string) {
      try {
        return SecureStore.setItemAsync(key, value);
      } catch (err) {
        return;
      }
    },
  };

async function dailyWorkoutCheck() {
    console.log('Background task dailyWorkoutCheck running...')
    /*
    const { healthKitAvailable, AppleHealthKit } = useContext(HealthKitContext);
    const [workedoutToday, setWorkedoutToday] = useState(false);
    const [workout, setWorkout] = useState(null); // [anchor, data
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    try {
        // fetch data here...
        if (healthKitAvailable) {
            let options = {
                startDate: (startOfDay).toISOString(), // 
                endDate: (new Date()).toISOString(),
                type: 'Workout', // one of: ['Walking', 'StairClimbing', 'Running', 'Cycling', 'Workout']
            };
            AppleHealthKit.getAnchoredWorkouts(options, (err: Object, results: AnchoredQueryResults) => {
                if (err) {
                return;
                }
                if (results.data.length) {
                    setWorkedoutToday(true);
                
                }
            });
        }
    } catch (err) {
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }

    if (workedoutToday) {
        console.log('Workout found');
        // Get the latest workout date from the device storage and check against workout from above
        const lastWorkoutDate = await workoutCache.getLatestStoredWorkout('lastWorkoutDate');
        if (lastWorkoutDate === startOfDay.toISOString()) {
            return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        // Save the workout data to DB and then cache the date on device
        const { getToken, userId } = useAuth();
        const supabaseAccessToken = await getToken({ template: 'supabase' });
        const supabase = supabaseClient(supabaseAccessToken);

        const wagerId = await SecureStore.getItemAsync('wager_id');

        const { error } = await supabase
        .from('workouts')
        .insert({ wager_id: wagerId, user_id: userId, workout_completed: true, workout_type: workout.type , workout_date: startOfDay });
        if (error) {
        console.log('Error fetching wager:', error);
        return;
        } else {
        console.log('Workout saved');
        }
    } else {
      console.log('No workout today');
    }

}


export async function initBackgroundFetch() {
  const taskName = 'daily-workout-check';
  const interval = 60 * 15; // in seconds
  try {
    if (!TaskManager.isTaskDefined(taskName)) {
      console.log('Task not defined, defining task...');
      TaskManager.defineTask(taskName, dailyWorkoutCheck);
    }
    const options = {
      minimumInterval: interval // in seconds
    };
    await BackgroundFetch.registerTaskAsync(taskName, options);
  } catch (err) {
    console.log("registerTaskAsync() failed:", err);
  }
}
*/

const StartPage = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
};

export default StartPage;
