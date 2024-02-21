import React, { useState } from 'react';
import { Modal, Pressable, Text, View, TouchableOpacity } from 'react-native';
import { Shadow } from 'react-native-shadow-2';

const WorkoutTable = ({ wagerId }: { wagerId: string | null }) => {
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

  if (wagerId === null) {
    // If no wager is active, return the same table with all grey cells and no modal and an overlay message to create a new wager
    return (
      <View className="flex justify-center items-center px-4">
        {Object.entries(workoutData).map(([week, days]) => (
          <View key={week} className="flex-row space-y-2 space-x-2 items-center">
            <Text className="text-white text-xs w-5">{week}</Text>
            {days.map((isWorkoutDone, index) => (
              <View key={`${week}-${index}`} className="flex h-10 w-10" >
                <Shadow startColor={'#050505'} paintInside={true} distance={4} style={{borderRadius: 10, flexDirection: "row", width: '100%', height:"100%" }}>
                    <View style={{backgroundColor: "#0D0D0D"}} className="flex border-2 bg-slate-50 pt-0.5 rounded-lg w-full justify-between pb-1 items-center">
                      <View style={{backgroundColor: "#71BC78", width: "60%", height:"10%"}} className="flex rounded-b items-center" />
                      <View className="flex-row h-fit w-fit">
                        <View className="h-fit w-fit rounded bg-neutral-900 px-1 py-1 mr-0.5 ">
                          <Text style={{fontSize: 10}} className="text-white text-center">0</Text>
                        </View>
                        <View className="h-fit w-fit rounded bg-neutral-900 px-1 py-1">
                          <Text style={{fontSize: 10}} className="text-white text-center">9</Text>
                        </View>
                      </View>
                    </View>
                </Shadow>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className="flex justify-center items-center px-4">
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