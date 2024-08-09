import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


async function registerForPushNotificationsAsync() {
    let token;
  
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
  
      if (existingStatus !== 'granted') {
        const hasAskedBefore = await AsyncStorage.getItem('hasAskedForNotificationPermission');
        
        if (hasAskedBefore !== 'true') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
          await AsyncStorage.setItem('hasAskedForNotificationPermission', 'true');
        }
      }
  
      if (finalStatus !== 'granted') {
        return null;
      }
  
      token = (await Notifications.getExpoPushTokenAsync()).data;
    } else {
      console.log('Must use physical device for Push Notifications');
    }
  
    return token;
  }

export default registerForPushNotificationsAsync;