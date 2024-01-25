import { View, Text, Pressable, Modal, TouchableOpacity, ScrollView } from 'react-native';
import React, {useState} from 'react';


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
    <View className="flex-row justify-center items-center">
      <TouchableOpacity onPress={decrement} className="p-2">
        <Text className="text-4xl text-white">-</Text>
      </TouchableOpacity>
      <Text className="text-4xl text-white mx-5">{`$${selectedAmount || 0}`}</Text>
      <TouchableOpacity onPress={increment} className="p-2">
        <Text className="text-4xl text-white">+</Text>
      </TouchableOpacity>
    </View>
  );
};

const CreateWager = () => {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [selectedRestDays, setSelectedRestDays] = useState(0);
  const [startDate, setStartDate] = useState(new Date());
  const endDate = new Date(startDate.getTime());
  endDate.setDate(endDate.getDate() + 30);

  const handleAmountPress = (amount) => {
    setSelectedAmount(amount);
  };

  const handleCharityPress = (charity) => {
    setSelectedCharity(charity);
  };

  const handleRestDaysChange = (days) => {
    setSelectedRestDays(days);
  };

  const renderRestDaysPicker = () => {
  return Array.from({ length: 5 }, (_, i) => (
    <TouchableOpacity key={i} onPress={() => handleRestDaysChange(i)} className={`p-2 ${selectedRestDays === i ? 'bg-blue-700' : 'bg-gray-300'}`}>
      <Text className='text-white'>{i} days</Text>
    </TouchableOpacity>
  ));
  };
  const amounts = [20, 50, 100, 200];
  const charities = ["Charity 1", "Charity 2", "Charity 3", "Charity 4", "Charity 5"]; 
  return(
    <View className='w-full h-full bg-neutral-900'>
      <View className='flex w-full justify-center items-center'>
        <View className='justify-start mt-10'>
          <Text className='text-3xl text-gray-100 mb-10'>Create Wager</Text>
        </View>
      </View>
      <View className="flex-1 justify-center items-center">
        <View className="border-solid border-2 border-zinc-700 p-5 rounded-lg w-4/5">
          {/* Wager Amount Stepper */}
          <WagerAmountStepper 
            amounts={amounts} 
            selectedAmount={selectedAmount} 
            onAmountChange={setSelectedAmount} 
          />

          {/* Charity Selection */}
          <ScrollView className="max-h-50">
            {charities.map((charity) => (
              <TouchableOpacity key={charity} onPress={() => handleCharityPress(charity)}
              className={`p-2 ${
                selectedCharity === charity ? 'bg-blue-700 border-blue-500' : 'border-gray-300'
              } border rounded my-1`}>
                <Text className="text-lg text-white">{charity}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Rest Days Selection */}
          <View className="flex-row justify-around mb-5">
            {renderRestDaysPicker()}
          </View>

          {/* Date Selection */}
          <Text className="mt-5 text-lg text-white">Start Date: {startDate.toDateString()}</Text>
          <Text className="text-lg text-white">End Date: {endDate.toDateString()}</Text>
        </View>
      </View>
    </View>
  );
}

export default CreateWager;