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
    'W4': [true, false, true, true, false, true, true],
  };

  const handleCellPress = (week: string, day: number) => {
    setSelectedDay(`Week: ${week}, Day: ${day}`);
    setModalVisible(true);
  };

  return (
    <View className="flex-1 items-center p-4 bg-neutral-900">
      {Object.entries(workoutData).map(([week, days]) => (
        <View key={week} className="flex-row items-center">
          <Text className="text-white w-8">{week}</Text>
          {days.map((isWorkoutDone, index) => (
            <TouchableOpacity
              key={`${week}-${index}`}
              onPress={() => handleCellPress(week, index + 1)}
              className={`flex-1 h-10 bg-gray-300`}
            >
                <View className={`h-full w-full rounded ${isWorkoutDone ? 'bg-green-500' : 'bg-red-500'}`} />
              {/* Cell content */}
            </TouchableOpacity>
          ))}
          <View className="w-12 h-10 border-2 border-yellow-400 border-opacity-100" />
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