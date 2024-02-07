import React, { useContext, useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import HealthKitContext from './HealthkitContext';



interface AnchoredQueryResults {
    anchor: string
    data: Array<any>
}

const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      height: 200, // Set this to the height you want
    },
    glass: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      // React Native does not support backdrop-filter, so this effect can't be replicated exactly
    },
    glow: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: 'rgba(255, 165, 0, 0.3)',
      // Create a shadow to act as a glow
      shadowColor: 'rgba(255, 165, 0, 0.9)',
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 10,
      shadowOpacity: 1,
      // React Native does not support CSS animations, so you would need to use the Animated API for any animations
    },
  });
  


const CurrentWorkoutStatus: React.FC = () => {
    let statusColor = 'black';
    let statusText = 'No Wager';
    const [todaysWorkout, setTodaysWorkout] = useState(false);
    const { healthKitAvailable, AppleHealthKit } = useContext(HealthKitContext);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    useEffect(() => {
        checkForWorkout();
    }, []);

    const checkForWorkout = () => {
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
                  setTodaysWorkout(true);
                }
            });
        }
    };
    return (
        <View style={styles.container}>
            <View style={styles.glass} />
            <View style={styles.glow} />
        </View>
    );
}

export default CurrentWorkoutStatus;