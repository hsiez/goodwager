import React, { useState, useEffect } from 'react';
import { Modal, Pressable, Text, View, TouchableOpacity } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import supabaseClient from '../utils/supabase';
import { useUser, useAuth } from '@clerk/clerk-expo';



const WagerCalendar = ({ wagerId, start_date }: { wagerId: string | null, start_date: Date }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [ wagerActive, setWagerActive ] = useState( (wagerId !== null) ? true : false);

  const workoutDataFlat = {};
  for (let i = 0; i < 21; i++) {
    var result = new Date(start_date);
    result.setDate(result.getDate() + i);
    workoutDataFlat[result.toString()] = {
      workedOut: false, 
      challengeDay: i + 1, 
      workoutType: null
    };
  }

  const SingleDay = ({ week, index }) => {
    const date = index[0];
    const data = index[1];
    const [workoutDay, setWorkoutDay] = useState([0, 0]);
    const [borderColor, setBorderColor] = useState("false");
    const [numberBg, setNumberBg] = useState('bg-neutral-900');
    const today = new Date().setHours(0, 0, 0, 0);


    useEffect(() => {
      if (data.challengeDay < 10) {
        setWorkoutDay([0, data.challengeDay]);
      } else {
        setWorkoutDay([Math.floor(data.challengeDay / 10), data.challengeDay % 10]);
      }
      if ([7, 14, 21].includes(data.challengeDay)) {
        setNumberBg("bg-neutral-600");
      }
      if (today === date || (wagerId === null && data.challengeDay === 1)) {
        setBorderColor("border-neutral-400");
      }
    }, [data.challengeDay]); 


    let statusColor: string;
    if (data.workedOut) {
      statusColor = '#71BC78';
    }
    else {
      statusColor = '#a1a1aa';
    }
    return (
      <TouchableOpacity
              key={`${week}-${date}`}
              onPress={() => handleCellPress(week, data.challengeDay + 1)}
              className={`flex justify-center rounded h-8 w-8`}
              disabled={!wagerActive}
            >
        <View key={data.challengeDay} className="flex h-10 w-10" >
          <Shadow startColor={'#050505'} paintInside={true} distance={4} style={{borderRadius: 10, flexDirection: "row", width: '100%', height:"100%" }}>
              <View style={{backgroundColor: "#0D0D0D"}} className={`flex border-0.5 ${borderColor} bg-slate-50 pt-0.5 rounded-lg w-full justify-between pb-1 items-center`}>
                <View style={{backgroundColor: statusColor, width: "60%", height:"10%"}} className="flex rounded-b items-center" />
                <View className="flex-row h-fit w-fit">
                  <View className={`h-fit w-3.5 rounded ${numberBg} px-1 py-1 mr-0.5`}>
                    <Text style={{fontSize: 10, color: "white" }} className="text-white text-center">{workoutDay[0]}</Text>
                  </View>
                  <View className={`h-fit w-3.5 rounded ${numberBg} px-1 py-1`}>
                    <Text style={{fontSize: 10, color: "white"}} className="text-white text-center">{workoutDay[1]}</Text>
                  </View>
                </View>
              </View>
          </Shadow>
        </View>
      </TouchableOpacity>

    );
  }


  const Week = ({ week, week_number }) => {
    return (
      <View key={week_number} className="flex-row w-full h-auto justify-between items-center">
        {week.map((index) => (
        < SingleDay week={week_number} index={index} />
        ))}
      </View>
    );
  }


  useEffect(() => {
    async function fetchData() {
      const supabase = supabaseClient(await getToken({ template: 'supabase' }));
      const { data, error } = await supabase
        .from('workouts')
        .select()
        .eq('wager_id', wagerId)
        .eq('user_id', user.id);
      if (error) {
        console.log('error', error);
      } else {
        console.log('Workout Data fetched');
        for (let workout of data) {
          workoutDataFlat[workout.date].workedOut = true;
          workoutDataFlat[workout.date].workoutType = workout.workout_type;
        }
      }
    }
    if (wagerId) {
      fetchData();
    }
  }, [wagerId]);

  const workoutEntries = Object.entries(workoutDataFlat);
  const weekOne = workoutEntries.slice(0, 7);
  const weekTwo = workoutEntries.slice(7, 14);
  const weekThree = workoutEntries.slice(14, 21);

  const handleCellPress = (week: string, day: number) => {
    setSelectedDay(`Week: ${week}, Day: ${day}`);
    setModalVisible(true);
  };
  return (
    <View className="flex-col h-full justify-between w-full items-center p-1">
      <Week week={weekOne} week_number={1} />
      <Week week={weekTwo} week_number={2} />
      <Week week={weekThree} week_number={3} />

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

export default WagerCalendar;