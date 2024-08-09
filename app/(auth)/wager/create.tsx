import { View, Text, Pressable, Modal, TouchableOpacity, Animated } from 'react-native';
import SwitchSelector from "react-native-switch-selector";
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import React, {useState} from 'react';
import supabaseClient from '../../utils/supabase';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store';
import "react-native-get-random-values";
import { v4 as uuidv4 } from 'uuid';
import * as Linking from 'expo-linking';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Shadow } from 'react-native-shadow-2';
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import * as Localization from 'expo-localization';


const WagerAmountStepper = ({ amounts, selectedAmount, onAmountChange }) => {
  const increment = () => {
    const currentIndex = amounts.indexOf(selectedAmount);
    const nextIndex = currentIndex + 1 < amounts.length ? currentIndex + 1 : currentIndex;
    onAmountChange(amounts[nextIndex]);
  };

  const decrement = () => {
    const currentIndex = amounts.indexOf(selectedAmount);
    const prevIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : currentIndex;
    onAmountChange(amounts[prevIndex]);
  };

  return (
    <View className="flex-row w-full mt-4 justify-between items-center pb-2">
      <View className="flex items-center">
        <Text className="text-4xl text-white text-start">{`$${selectedAmount}`}</Text>
      </View>
      <View className="flex-row space-x-1">
        <TouchableOpacity onPress={decrement} className="">
        <Shadow startColor={'#050505'} distance={2} style={{borderRadius: 8}}>
              <View style={{borderColor: "#fff"}} className='flex justify-center items-center h-10 w-10 border  rounded-xl'>
                      <Svg height="100%" width="100%" >
                          <Defs>
                              <RadialGradient id="grad" cx="50%" cy="50%" r="100%" fx="50%" fy="50%">
                                  <Stop offset="35%" stopColor="#0D0D0D" stopOpacity="1" />
                                  <Stop offset="100%" stopColor="#fff" stopOpacity="1" />
                              </RadialGradient>
                          
                          </Defs>
                          <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" rx={11} ry={11}/>
                          <View className="flex h-full w-full justify-center items-center ">
                            <Ionicons name="remove-outline" size={20} color={'#fff'} />
                          </View>
                      </Svg>
              </View>
            </Shadow>
        </TouchableOpacity>
        <TouchableOpacity onPress={increment} className="">
          <Shadow startColor={'#050505'} distance={2} style={{borderRadius: 8}}>
              <View style={{borderColor: "#fff"}} className='flex justify-center items-center h-10 w-10 border  rounded-xl'>
                      <Svg height="100%" width="100%" >
                          <Defs>
                              <RadialGradient id="grad" cx="50%" cy="50%" r="100%" fx="50%" fy="50%">
                                  <Stop offset="35%" stopColor="#0D0D0D" stopOpacity="1" />
                                  <Stop offset="100%" stopColor="#fff" stopOpacity="1" />
                              </RadialGradient>
                          
                          </Defs>
                          <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" rx={11} ry={11}/>
                          <View className="flex h-full w-full justify-center items-center ">
                            <Ionicons name="add-outline" size={20} color={'#fff'} />
                          </View>
                      </Svg>
              </View>
            </Shadow>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const CreateWager = () => {

  // User Data
  const { user } = useUser();
  const { getToken } = useAuth();
  const nav = useRouter();
  const tzone = Localization.getCalendars()[0].timeZone;
  
  // State for wager amount
  const [selectedAmount, setSelectedAmount] = useState(20);
  const amounts = [20, 50, 100, 200];

  // State for charity selection
  const charities = [
    {label: 'Samaritan', value: 'samaritan', url: 'samaritan.city', id: "7d167796-a0ba-49ec-8fd2-48babc2b64c3"},
    {label: 'Red Cross', value: 'samaritan', url: 'redcross.com', id: "7d167796-a0ba-49ec-8fd2-48babc2b64c3"},
    {label: 'Doctors w/o Borders', value: 'samaritan', url: 'dwb.org', id: "7d167796-a0ba-49ec-8fd2-48babc2b64c3"},
  ]
  const [selectedCharityIndex, setSelectedCharityIndex] = useState(0);
  const translateX = new Animated.Value(0);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      Animated.timing(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();

      // Swipe left (next charity)
      if (event.nativeEvent.translationX < -50) {
        setSelectedCharityIndex(prev => (prev + 1) % charities.length);
      }
      // Swipe right (previous charity)
      else if (event.nativeEvent.translationX > 50) {
        setSelectedCharityIndex(prev => (prev - 1 + charities.length) % charities.length);
      }
    }
  };
  const selectedCharity = charities[selectedCharityIndex];

  const startDate = new Date(new Date().setHours(0, 0, 0, 0));
  const endDate = new Date(new Date(startDate).getTime());
  endDate.setDate(endDate.getDate() + 21);
  
  const checkpoint1 = new Date(startDate);
  checkpoint1.setDate(checkpoint1.getDate() + 6);

  const checkpoint2 = new Date(checkpoint1);
  checkpoint2.setDate(checkpoint2.getDate() + 7);

  const checkpoint3 = new Date(checkpoint2);
  checkpoint3.setDate(checkpoint3.getDate() + 7);
  // State for info modal
  const [modalVisible, setModalVisible] = useState(false);

  // Handle Wager Creation
  const handleWagerCreation = async() => {
    console.log('Wager Creation');
    const supabase = supabaseClient(await getToken({ template: 'supabase' }));
    const wager_id = uuidv4();
    const { error } = await supabase
      .from('wagers')
      .insert(
        { wager_id: wager_id,
          user_id: user.id, 
          amount: selectedAmount,
          charity_id: selectedCharity.id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          token: 'token',
          status: 'ongoing',
          last_date_completed: null,
          time_zone: tzone
        })
    if (error) {
      console.log('error inserting new wager', error);
    } else {
      console.log('Wager created');
      await SecureStore.setItemAsync('wager_id', wager_id);
      console.log('Wager ID stored');

      // Create and stort 21 day workout data
      const wager_tracker = {};
      for (let i = 0; i < 21; i++) {
        var result = new Date(startDate);
        result.setDate(result.getDate() + i);
        wager_tracker[result.toISOString()] = {
          challengeDay: i + 1, 
        };
      SecureStore.setItemAsync('wager_tracker', JSON.stringify(wager_tracker));
      console.log('Wager Tracker stored');
      }
      nav.back();

    }

  };

  return(
    <View style={{backgroundColor: "#090909"}} className='flex w-full h-full justify-between'>
      <View className="flex-col items-center justify-between">
        <View className="flex h-full py-10 justify-between rounded-lg px-5">

          {/* Header */}
          <Shadow startColor={'#050505'} distance={3} style={{borderRadius: 12}}>
            <View style={{backgroundColor: "#0D0D0D"}} className="w-full flex-col justify-between items-center border-neutral-800 rounded-xl border p-2 ">
              <View className='flex-col w-full h-fit items-center space-y-2 justify-center'>
                <View className="flex-col w-full h-fit px-2">
                  <Text style={{ fontSize: 14 }} className="text-white text-pretty mb-2">
                    A goodwager is a streak challenge that requires you to perform at least 60 minutes of exercise every day for 21 days.
                  </Text>
                  <Text style={{ fontSize: 14 }} className="text-white text-pretty">
                    Breaking the streak will trigger an automated donation from your account to a selected charity.
                  </Text>
                </View>
              </View>
            </View>
          </Shadow>
          
          {/* Charity info */}
          <View className="flex-col w-full justify-between items-start">
            <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
              <Animated.View
                style={{ transform: [{ translateX }], }}>
                <View className="flex-col w-full justify-between items-start pb-1">
                  <Text style={{fontSize: 12}} className="text-neutral-600 font-semibold">NONPROFIT</Text>
                  <Animated.Text className="text-2xl text-white">{selectedCharity.label}</Animated.Text>
                  <Pressable className="flex-row h-4 items-center space-x-2" onPress={() => Linking.openURL(selectedCharity.url)}>
                    <Text style={{fontSize: 10}} className=" font-semibold text-rose-500">Learn more</Text>
                    <Text style={{fontSize: 10}} className="text-neutral-600 font-semibold">{selectedCharity.url}</Text>
                  </Pressable>
                </View>
              </Animated.View>
            </PanGestureHandler>

            {/* Wager Amount Stepper */}
            <WagerAmountStepper 
              amounts={amounts} 
              selectedAmount={selectedAmount} 
              onAmountChange={setSelectedAmount} 
            />
          </View>

          {/* Dates */}
          <View className="flex-row w-full justify-between items-center">
            <View className='flex-col w-14 h-14 space-y-2 justify-center'>
              <View className='flex w-full items-center'>
                <FontAwesome6 name="flag" size={20} color={'#e87878'} />
              </View>
              <View className='flex w-full h-fit justify-center items-center'>
                <Text style={{fontSize: 12}} className="text-white">{startDate.toLocaleString('default', { month: 'short' })} {startDate.getDate()}</Text>
              </View>
            </View>

            {/* slash line connecting two dates */}
            <View className='flex-1 h-1 items-center justify-center border-2 border-neutral-400 border-dotted'/>

            <View className='flex-col w-14 h-14 items-center space-y-2 justify-center'>
              <View className='flex w-full items-center'>
                <FontAwesome6 name="flag-checkered" size={20} color={'#fff'} />
              </View>
              <View className='flex w-full h-fit justify-center items-center'>
                <Text style={{fontSize: 12}} className="text-white">{endDate.toLocaleString('default', { month: 'short' })} {checkpoint3.getDate()}</Text>
              </View>
            </View>
          </View>

          
          {/* Submit and Cancel Buttons */}
          <View className="flex-row h-11 w-full px-2 justify-center">
            <TouchableOpacity className="flex w-full h-full justify-center bg-neutral-300 rounded-2xl" onPress={handleWagerCreation}>
              <Text className="text-black font-bold text-xs text-center">Send It</Text>
            </TouchableOpacity>
          </View>
         
        </View>
      </View>
    </View>
  );
}

export default CreateWager;