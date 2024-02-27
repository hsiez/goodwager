import { View, Text, Pressable, Modal, TouchableOpacity, Animated } from 'react-native';
import SwitchSelector from "react-native-switch-selector";
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import React, {useState} from 'react';
import supabaseClient from '../../utils/supabase';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import "react-native-get-random-values";
import { v4 as uuidv4 } from 'uuid';
import * as Linking from 'expo-linking';
import { PanGestureHandler, State } from 'react-native-gesture-handler';


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
        <Text className="text-5xl text-white text-start">{`$${selectedAmount}`}</Text>
      </View>
      <View className="flex-row space-x-3">
        <TouchableOpacity onPress={decrement} className="">
          <View className="p-1 border-2 flex h-15 w-15 items-center justify-center rounded-full" style={{borderColor: "#3f4548"}}>
            <Ionicons name="remove-outline" size={35} color={'#fff'} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={increment} className="">
          <View className="p-1 border-2 flex h-15 w-15 items-center justify-center rounded-full" style={{borderColor: "#3f4548"}}>
            <Ionicons name="add-outline" size={35} color={'#fff'}/>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const CreateWager = () => {

  // User Data
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  
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

  // State for workout days selection
  const [workOutDays, setWorkOutDays] = useState(4);
  const workOutDaysOptions = [
    { label: "4 Days", value: 4, accessibilityLabel: "switch-4" },
    { label: "5 Days", value: 5, accessibilityLabel: "switch-5" },
    { label: "6 Days", value: 6, accessibilityLabel: "switch-6" },
    { label: "7 Days", value: 7, accessibilityLabel: "switch-7" }
  ];
  const startDate = new Date();
  const endDate = new Date(startDate.getTime());
  endDate.setDate(endDate.getDate() + 28);

  // State for info modal
  const [modalVisible, setModalVisible] = useState(false);

  // Handle Wager Cancel
  const handleWagerCancel = () => {
    router.push('/home');
  };

  // Handle Wager Creation
  const handleWagerCreation = async() => {
    console.log('Wager Creation');
    const supabase = supabaseClient(await getToken({ template: 'supabase' }));
    const wager_id = uuidv4();
    const { error } = await supabase
      .from('wagers')
      .insert(
        { wager_id: wager_id,
          userId: user.id, 
          amount: selectedAmount,
          charity_name: selectedCharity.id,
          start_date: startDate,
          end_date: endDate,
          workout_freq: workOutDays,
          token: 'token',
          status: 'alive',
          ongoing: true
        })
    if (error) {
      console.log('error', error);
    } else {
      console.log('Wager created');
      await SecureStore.setItemAsync('wager_id', wager_id);
      console.log('Wager ID stored');
      router.push('/wager/index');

    }

  };

  return(
    <View className='flex w-full h-full justify-between bg-neutral-900'>
      <View className='flex w-full justify-center items-center'>
      </View>
      <View className="flex-1 mt-10 mb-20 items-center">
        <View className="flex h-full justify-between rounded-lg w-4/5">
          {/* Charity info */}
          <View className="flex-col w-full justify-between items-start">
            <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
              <Animated.View
                style={{ transform: [{ translateX }], }}>
                <View className="flex-col w-full justify-between items-start pb-1">
                  <Text className="text-xs text-white">NONPROFIT</Text>
                  <Animated.Text className="text-3xl text-white">{selectedCharity.label}</Animated.Text>
                  <Pressable className="flex-row space-x-2" onPress={() => Linking.openURL(selectedCharity.url)}>
                    <Text className="text-xs font-mono text-rose-600">Learn more</Text>
                    <Text className="text-xs font-mono text-white">{selectedCharity.url}</Text>
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
            

          {/* Workout days Selection */}
          <View className="flex-col justify-between">
            <View className="flex justify-center">
              <Text className="mb-2 text-lg text-white">Workouts per week</Text>
              <SwitchSelector
                options={workOutDaysOptions}
                initial={0}
                onPress={value => setWorkOutDays(value)}
                buttonColor="#e87878"
                borderColor='rgb(252 211 77)'
                borderRadius={8}
                borderWidth={9}
                backgroundColor='#171717'
                textStyle={{color: 'white'}}
              />
            </View>
          </View>
          
          {/* Timeline */}
          <View className="flex-col w-full justify-between">
            <View className='flex-row w-full mb-2'>
              <Text className='text-lg text-white pr-2'>Milestones</Text>
              <Pressable onPress={() => setModalVisible(true)}>
                <Ionicons name="information-circle-outline" size={30} color={'#3f4548'} />
              </Pressable>
            </View>
            {/* Milestone Info Modal */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
                <View className='flex-1 justify-center items-center'>
                  <View className='m-5 bg-black bg-opacity-70 rounded-lg p-5 items-center'>
                    <Pressable className='self-start' onPress={() => setModalVisible(false)}>
                      <Ionicons name="close" size={30} color={'#fff'} />
                    </Pressable>
                    <Text className='text-white text-left mb-4'>
                      "It takes 21 days to build a habit! goodwager programs 3 checkpoints every 7 days. If you don't match the workout frequency you selected before the checkpoint days are over, your donation will be processed."
                    </Text>
                  </View>
                </View>
            </Modal>

            <View className="w-full flex-row justify-between items-center">
                <View className='flex-col w-14 h-14 justify-center'>
                  <View className='flex w-full items-center'>
                  <FontAwesome6 name="flag" size={20} color={'#e87878'} />
                  </View>
                  <Text className="text-sm text-white ml-2">01/23</Text>
                </View>

                <View className='flex-col w-14 h-14 justify-center'>
                  <View className='flex w-full items-center'>
                    <Ionicons name="checkmark-done" size={20} color={'#fff'} />
                  </View>
                  <Text className="text-sm text-white ml-2">01/23</Text>
                </View>

                <View className='flex-col w-14 h-14 justify-center'>
                  <View className='flex w-full items-center'>
                    <Ionicons name="checkmark-done" size={20} color={'#fff'} />
                  </View>
                  <Text className="text-sm text-white ml-2">01/23</Text>
                </View>

                <View className='flex-col w-14 h-14 justify-center'>
                  <View className='flex w-full items-center'>
                    <Ionicons name="checkmark-done" size={20} color={'#fff'} />
                  </View>
                  <Text className="text-sm text-white ml-2">01/23</Text>
                </View>

                <View className='flex-col w-14 h-14 justify-center'>
                  <View className='flex w-full items-center'>
                  <FontAwesome6 name="flag-checkered" size={20} color={'#fff'} />
                  </View>
                  <Text className="text-sm text-white ml-2">01/23</Text>
                </View>
            </View>
          </View>
          {/* Submit and Cancel Buttons */}
          <View className="flex-row h-11 w-full justify-between mt-10">
            <TouchableOpacity className="flex w-full h-full justify-center bg-zinc-100 rounded-3xl" onPress={handleWagerCreation}>
              <Text className="text-black font-bold text-xs text-center">Send It</Text>
            </TouchableOpacity>
          </View>
         
        </View>
      </View>
    </View>
  );
}

export default CreateWager;