import { View, Text, Pressable, Modal, TouchableOpacity, Animated, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native';
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


const AmountStepper = ({ amounts, selectedAmount, onAmountChange, type }) => {
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
    <View className="flex-row w-full mt-2 justify-between items-center pb-2">
      <View className="flex-row items-center">
        <Text className="text-4xl text-white text-start">{type === "money" ? '$' : ''}</Text>
        <Text className="text-4xl text-white text-start">{`${selectedAmount}`}</Text>
        <Text className="text-2xl text-white text-end">{type === "time" ? ' min' : ''}</Text>
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

    // State for duration amount
    const [selectedDuration, setSelectedDuration] = useState(60);
    const durations = [30, 60, 90];

  // State for charity selection
  const [charityEIN, setCharityEIN] = useState('');
  const [charityName, setCharityName] = useState('');
  const [charitySubmitted, setCharitySubmitted] = useState(false);

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
          charity_id: "selectedCharity.id",
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'ongoing',
          last_date_completed: null,
          time_zone: tzone,
          workout_duration: selectedDuration,
        })
    if (error) {
      console.log('error inserting new wager', error);
    } else {
      console.log('Wager created');
      await SecureStore.setItemAsync('wager_id', wager_id);
      console.log('Wager ID stored');
      nav.back();

    }

  };

  const submitCharity = async () => {
    try {
      setCharitySubmitted(true);
      Keyboard.dismiss();
      const response = await fetch(`https://partners.every.org/v0.2/nonprofit/${charityEIN}?apiKey=pk_live_b1d68367f5738c0105230011e50f00b7`);
      
      if (response.ok) {
        console.log('Charity found');
        const data = await response.json();
        if (data.data.nonprofit.name) {
          setCharityName(data.data.nonprofit.name);
        }
      } else {
        // Handle error case
      }
    } catch (error) {
      console.log('Error fetching charity:', error);
    }
};

  return(
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} style={{backgroundColor: "#090909"}} className='flex w-full h-full justify-between'>
      <View style={{backgroundColor: "#090909"}} className="flex-col w-full h-full items-center justify-between">
        <View className="flex h-full py-10 justify-between rounded-lg px-5">

          {/* Header */}
          <View className="flex-row justify-start items-center space-x-2 mb-1">
            <Text className="text-white text-2xl font-bold">Create Wager</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Ionicons name="information-circle-outline" size={20} color="grey" />
            </TouchableOpacity>
          </View>

          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
              <View className="bg-neutral-800 p-4 rounded-xl w-4/5">
                <Text className="text-white text-lg font-bold mb-2">Wager Information</Text>
                <Text className="text-white mb-2">
                  A goodwager is a streak challenge that requires you to perform at least 60 minutes of exercise every day for 21 days.
                </Text>
                <Text className="text-white mb-4">
                  If you fail to complete the challenge, you must donate and show proof of donation to the selected charity.
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="bg-blue-500 p-2 rounded-lg self-end"
                >
                  <Text className="text-white font-bold">Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          
          {/* Charity info */}
          <View className="flex-col h-fit space-y-4 w-full justify-between items-start">
            <View className="flex-col w-full justify-between items-start pb-1">
              <Text style={{fontSize: 12}} className="text-neutral-600 font-semibold pb-1">Search Charity</Text>
              <View className="flex-row w-full items-center space-x-2">
                <TextInput
                  className="flex-1 h-10 px-2 text-white bg-neutral-800 rounded"
                  placeholder="Enter charity EIN"
                  placeholderTextColor="#999"
                  value={charityEIN}
                  onChangeText={(text) => {
                    const formattedText = text.replace(/[^0-9-]/g, '');
                    if (formattedText.length <= 10) {
                      let newText = formattedText;
                      if (formattedText.length >= 3 && formattedText[2] !== '-') {
                        newText = formattedText.slice(0, 2) + '-' + formattedText.slice(2);
                      }
                      setCharityEIN(newText);
                    }
                  }}
                  maxLength={10}
                  keyboardType="numeric"
                  blurOnSubmit={true}
                  onBlur={() => Keyboard.dismiss()}
                />
                <TouchableOpacity onPress={submitCharity} className="bg-blue-500 p-2 rounded">
                  <Text className="text-white">Submit</Text>
                </TouchableOpacity>
              </View>
              {charitySubmitted && (
                <View className="flex-row items-center mt-2">
                  {charityName ? (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="green" />
                      <View className="flex-row flex-wrap ml-2">
                        <Text className="text-white">{charityName}</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <Ionicons name="close-circle" size={20} color="red" />
                      <Text className="ml-2 text-white">Charity not found</Text>
                    </>
                  )}
                </View>
              )}
            </View>

            {/* Wager Amount Stepper */}
            <View className="flex-col w-full h-fit items-start">
              <Text style={{fontSize: 12}} className="text-neutral-600 font-semibold">Pledge Amount </Text>
              <AmountStepper 
                amounts={amounts} 
                selectedAmount={selectedAmount} 
                onAmountChange={setSelectedAmount} 
                type="money"
              />
            </View>
          </View>

          {/* Duration Amount Stepper */}
          <View className="flex-col w-full h-fit items-start">
              <Text style={{fontSize: 12}} className="text-neutral-600 font-semibold">Minimum Workout Duration</Text>
              <AmountStepper 
                amounts={durations} 
                selectedAmount={selectedDuration} 
                onAmountChange={setSelectedDuration}
                type="time"
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
    </TouchableWithoutFeedback>
  );
}

export default CreateWager;