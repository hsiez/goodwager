import React, { useEffect, useState } from 'react';
import AppleHealthKit from 'react-native-health';
import HealthKitContext from './HealthkitContext';

const HealthKitProvider = ({ children }) => {
  const [healthKitAvailable, setHealthKitAvailable] = useState<boolean>(false);

  useEffect(() => {
    const permissions = {
      permissions: {
        read: [AppleHealthKit.Constants.Permissions.HeartRate, AppleHealthKit.Constants.Permissions.Workout],
        write: [AppleHealthKit.Constants.Permissions.Steps, AppleHealthKit.Constants.Permissions.Workout],
      },
    };

    AppleHealthKit.initHealthKit(permissions, (error) => {
      if (error) {
        console.log('[ERROR] Cannot grant permissions!');
        return;
      }
      // HealthKit is initialized and permissions are granted
      setHealthKitAvailable(true);
    });
  }, []);

  return (
    <HealthKitContext.Provider value={{ healthKitAvailable, AppleHealthKit }}>
      {children}
    </HealthKitContext.Provider>
  );
};

export default HealthKitProvider;