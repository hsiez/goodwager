import React, { useState } from 'react';
import { Modal, Pressable, Text, View, TouchableOpacity } from 'react-native';

const WorkoutTable = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');

  // Example workout data
  const workoutData = {
    'W1': [true, false, true, false, true, false, true],
    'W2': [true, true, false, true, false, true, false],
    'W3': [false, true, true, false, true, true, false],
  };

  const handleCellPress = (week: string, day: number) => {
    setSelectedDay(`Week: ${week}, Day: ${day}`);
    setModalVisible(true);
  };

  return (
    <View className="flex h-40 justify-center items-center px-4  border rounded-lg border-zinc-600">
      {Object.entries(workoutData).map(([week, days]) => (
        <View key={week} className="flex-row space-y-2 space-x-2 items-center">
          <Text className="text-white text-xs w-5">{week}</Text>
          {days.map((isWorkoutDone, index) => (
            <TouchableOpacity
              key={`${week}-${index}`}
              onPress={() => handleCellPress(week, index + 1)}
              className={`flex justify-center rounded h-8 w-8`}
            >
                <View className={`h-full w-full rounded ${isWorkoutDone ? 'bg-teal-700' : 'bg-pink-900'} ${index===6 ? 'shadow shadow-green-400' : ''}`}>
                </View>
              {/* Cell content */}
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center bg-black bg-opacity-50"
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-white p-4 rounded-lg">
            <Text className="text-black">{selectedDay}</Text>
            {/* Modal content */}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default WorkoutTable;