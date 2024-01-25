import { View, Text, Pressable, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import React, {useState} from 'react';


const styles = StyleSheet.create({
  dropdownContainer: {
    height: 40,
    width: 75, // Set width to fit single digit number
  },
  dropdown: {
    backgroundColor: '#fafafa',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  dropdownItem: {
    justifyContent: 'center', // Center the items in dropdown vertically
  },
  dropdownLabel: {
    fontSize: 16, // Set font size as needed
    textAlign: 'center', // Center the label text horizontally
  },
});

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

  // State for wager amount
  const [selectedAmount, setSelectedAmount] = useState(20);

  // State for charity selection
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [openCharity, setOpenCharity] = useState(false);
  const [items, setItems] = useState([
    {label: 'Charity 1', value: 'charity1'},
    {label: 'Charity 2', value: 'charity2'},
    {label: 'Charity 3', value: 'charity3'}
  ]);

  // State for workout days selection
  const [openWorkout, setOpenWorkout] = useState(false);
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState(1); // default to 1 workout per week
  const [workoutItems, setWorkoutItems] = useState(Array.from({ length: 7 }, (_, i) => ({
    label: `${i + 1}`,
    value: i + 1,
  })));
  const [startDate, setStartDate] = useState(new Date());
  const endDate = new Date(startDate.getTime());
  endDate.setDate(endDate.getDate() + 30);

  const handleAmountPress = (amount) => {
    setSelectedAmount(amount);
  };

  const handleCharityPress = (charity) => {
    setSelectedCharity(charity);
  };

  const amounts = [20, 50, 100, 200];
  const charities = ["Charity 1", "Charity 2", "Charity 3", "Charity 4", "Charity 5"]; 
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
          <View className="flex-row mt-10 justify-between">
            <View className="flex justify-center">
              <Text className="text-lg text-white">Workouts per week:</Text>
            </View>
            <DropDownPicker
              open={openWorkout}
              value={workoutsPerWeek}
              items={workoutItems}
              setOpen={setOpenWorkout}
              setValue={setWorkoutsPerWeek}
              setItems={setWorkoutItems}
              theme="DARK"
              placeholder="0"
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
            />

          </View>

          <Text className="mt-5 text-lg text-white">Start Date: {startDate.toDateString()}</Text>
          <Text className="text-lg text-white">End Date: {endDate.toDateString()}</Text>
        </View>
      </View>
    </View>
  );
}

export default CreateWager;