import { View, Text, Pressable, FlatList, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import SwitchSelector from "react-native-switch-selector";
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import React, {useState} from 'react';
import supabaseClient from '../utils/supabase';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { initBackgroundFetch } from '../background-tasks';
import * as SecureStore from 'expo-secure-store';
import { v4 as uuidv4 } from 'uuid';


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
    <View className="flex-row justify-center items-center pb-2">
      <TouchableOpacity onPress={decrement} className="p-2">
        <Ionicons name="arrow-down-circle-outline" size={40} color={'#fff'} />
      </TouchableOpacity>
      <Text className="text-6xl text-white mx-5">{`$${selectedAmount}`}</Text>
      <TouchableOpacity onPress={increment} className="p-2">
        <Ionicons name="arrow-up-circle-outline" size={40} color={'#fff'} selectionColor={''}/>
      </TouchableOpacity>
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
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [openCharity, setOpenCharity] = useState(false);
  const [items, setItems] = useState([
    {label: 'Charity 1', value: 'charity1'},
    {label: 'Charity 2', value: 'charity2'},
    {label: 'Charity 3', value: 'charity3'}
  ]);

  // State for workout days selection
  const [workOutDays, setWorkOutDays] = useState(4);
  const workOutDaysOptions = [
    { label: "4", value: 4, accessibilityLabel: "switch-4" },
    { label: "5", value: 5, accessibilityLabel: "switch-5" },
    { label: "6", value: 6, accessibilityLabel: "switch-6" },
    { label: "7", value: 7, accessibilityLabel: "switch-7" }
  ];
  const startDate = new Date();
  const endDate = new Date(startDate.getTime());
  endDate.setDate(endDate.getDate() + 28);

  // State for Drag and Drop submit
  const [draggedItem, setDraggedItem] = useState(null);

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
          charity_name: selectedCharity,
          start_date: startDate,
          end_date: endDate,
          token: 'token',
          status: 'alive',
          ongoing: true
        })
    if (error) {
      console.log('error', error);
    } else {
      console.log('Wager created');
      await SecureStore.setItemAsync('wager_id', uuidv4());
      initBackgroundFetch();
      router.push('/home');

    }

  };

  return(
    <View className='w-full h-full bg-neutral-900'>
      <View className='flex w-full justify-center items-center'>
        <View className='justify-start mt-10'>
          <Text className='text-3xl text-gray-100'>Create Wager</Text>
        </View>
      </View>
      <View className="flex-1 mt-20 items-center">
        <View className="rounded-lg w-4/5">
          {/* Wager Amount Stepper */}
          <WagerAmountStepper 
            amounts={amounts} 
            selectedAmount={selectedAmount} 
            onAmountChange={setSelectedAmount} 
          />
            
          {/* Charity Selection */}
          <DropDownPicker
            style={{backgroundColor: 'rgb(64 64 64)', borderColor: 'rgb(252 211 77)', borderWidth: 2, borderRadius: 8}}
            open={openCharity}
            value={selectedCharity}
            items={items}
            setOpen={setOpenCharity}
            setValue={setSelectedCharity}
            setItems={setItems}
            theme="DARK"
            placeholder="Select a Charity"
          />

          {/* Workout days Selection */}
          <View className="flex-col mt-10 justify-between">
            <View className="flex justify-center">
              <Text className="mb-4 text-lg text-white">Workouts per week:</Text>
              <SwitchSelector
                options={workOutDaysOptions}
                initial={0}
                onPress={value => setWorkOutDays(value)}
                buttonColor="rgb(252 211 77)"
                borderColor='rgb(252 211 77)'
                borderRadius={8}
                borderWidth={9}
                backgroundColor='rgb(64 64 64)'
                textStyle={{color: 'black'}}
              />
            </View>
          </View>
          
          {/* Timeline */}
          <Text className="text-lg text-white mt-10">Schedule:</Text>
          <View className="mt-4 w-full flex-row justify-between items-center">
              <View className='flex-col w-14 h-14 justify-center'>
                <View className='flex w-full items-center'>
                <FontAwesome6 name="flag" size={20} color={'rgb(5 150 105)'} />
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
          {/* Submit and Cancel Buttons */}
          <View className="flex-row h-12 justify-between mt-10">
            <TouchableOpacity className="flex justify-center border-rose-600 rounded-md border-2 pr-4 pl-4 pt-2 pb-2" onPress={handleWagerCancel}>
              <Text className="text-white text-center">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex justify-center border-emerald-600 rounded-md border-2 pr-4 pl-4 pt-2 pb-2" onPress={handleWagerCreation}>
              <Text className="text-white">Submit</Text>
            </TouchableOpacity>

          </View>
         
        </View>
      </View>
    </View>
  );
}

export default CreateWager;