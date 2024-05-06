import React, { useState, useEffect } from 'react';
import { Modal, Pressable, Text, View, TouchableOpacity, ImageBackground } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import supabaseClient from '../utils/supabase';
import { useUser, useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import { Ionicons } from '@expo/vector-icons'; // Make sure you have expo/vector-icons installed


const weeks = [[1, 7],[8, 14], [15, 21]];

const CARD_IMAGES = {
  green: require("../assets/images/cg1.png"),
  white: require("../assets/images/cw2.png"),
};

const WagerCalendar = ({ last_date_completed, start_date }: { last_date_completed: string | null, start_date: Date }) => {
  const { user } = useUser();
  const [modalVisible, setModalVisible] = useState(false);
  const [isCalModalVisible, setIsCalModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [ wagerActive, setWagerActive ] = useState( (start_date !== null) ? true : false);
  const [wagerTrackerData, setWagerTrackerData] = useState({});
  const [currentWeek, setCurrentWeek] = useState(1);
  const [todayNumber, setTodayNumber] = useState(0);
  const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();


  const SingleDay = ({ week, index }) => {
    const date = index[0];
    const data = index[1];
    const [workoutDay, setWorkoutDay] = useState([0, 0]);
    const [borderInfo, setBorderInfo] = useState("");
    const [numberBg, setNumberBg] = useState('');
    const [numberTextColor, setNumberTextColor] = useState('#262626');


    useEffect(() => {
      if (data.challengeDay < 10) {
        setWorkoutDay([0, data.challengeDay]);
      } else {
        setWorkoutDay([Math.floor(data.challengeDay / 10), data.challengeDay % 10]);
      }
      {/*
      if ([7, 14, 21].includes(data.challengeDay)) {
        setNumberBg("bg-neutral-200");
        setNumberTextColor("black");
      }
      */}
      if (date < today) {
        setNumberTextColor("#e5e5e5");
      }
      if (today === date) {
        setBorderInfo("border-neutral-500 border");
        setNumberTextColor("#e5e5e5");
      }
    }, [data.challengeDay]); 


    const bg_key = data.workedOut ? "green" : "white";
    const day_bg = CARD_IMAGES[bg_key];
    console.log(date)

    const Icon = () => {
      if (date < today ) {
        return (
          <Ionicons name="checkmark-done-circle-outline" size={24} color="#00ff00" />
        );
      } else {
        return (
          <Ionicons name="ellipse-outline" size={24} color={numberTextColor} />
        );
      }
    }
    
    return (
      <TouchableOpacity
              key={`${week}-${date}`}
              onPress={() => handleCellPress(week, data.challengeDay + 1)}
              className={`flex justify-center rounded-lg h-11 w-11 p-1 ${borderInfo}`}
              disabled={!wagerActive}
            >
        <View key={data.challengeDay} className="flex h-full w-full" >
              <View style={{paddingVertical: 0.5}} className={`flex-col w-full justify-center items-center rounded`}>
                <View className="flex justify-center items-center">
                  <Icon />
                </View>
                <View className="flex-row h-fit  w-fit justify-center items-center space-x-0.5">
                  <View className={`flex justify-center items-center rounded h-4 w-2 ${numberBg}`}>
                    <Text style={{fontSize: 10, color: numberTextColor}} className={`font-bold`}>{workoutDay[0]}</Text>
                  </View>
                  <View className={`flex justify-center items-center rounded h-4 w-2 ${numberBg}`}>
                    <Text style={{fontSize: 10, color: numberTextColor}} className={`font-bold`}>{workoutDay[1]}</Text>
                  </View>
                </View>
              </View>
        </View>
      </TouchableOpacity>

    );
  }


  const Week = ({ week, week_number }) => {
    return (
      <View className="flex-row w-full h-fit justify-between items-center">
        {week.map((index) => (<SingleDay key={index} week={week_number} index={index}/>))}
      </View>
    );
  }


  useEffect(() => {
    async function setUpCalendar() {
      if (start_date !== null) {
        setWagerTrackerData(JSON.parse(await SecureStore.getItemAsync("wager_tracker")));
      }
    }
    if (start_date !== null){
      setUpCalendar();
      for (let i = 0; i < 3; i++) {
        if (todayNumber >= weeks[i][0] && todayNumber <= weeks[i][1]) {
          setCurrentWeek(i + 1);
        }
      }
    }
    else {
      console.log("Setting up calendar");
          const workoutDataFlat = {};
          for (let i = 0; i < 21; i++) {
            var result = new Date(start_date);
            result.setDate(result.getDate() + i);
            workoutDataFlat[result.toString()] = {
              challengeDay: i + 1, 
              workoutData: null
            };
            if (result.toString() === today) {
              setTodayNumber(i + 1);
            }
          setWagerTrackerData(workoutDataFlat);
        }
    }
  }, [ start_date]);

  const workoutEntries = Object.entries(wagerTrackerData);
  const week_map = {
    1: workoutEntries.slice(0, 7),
    2: workoutEntries.slice(7, 14),
    3: workoutEntries.slice(14, 21)
  };

  const handleCellPress = (week: string, day: number) => {
    setSelectedDay(`Week: ${week}, Day: ${day}`);
    setModalVisible(true);
  };
  return (


    <View className='flex-col h-full w-full justify-center items-center'>
      <View className='flex-row w-full items-center justify-start mb-2 px-1'>
        <Text style={{fontSize: 12}} className="text-white font-semibold">Progress</Text>
      </View>
    <Shadow startColor={'#050505'} distance={0} style={{borderRadius: 10 }}>
    <View className="flex h-full w-full justify-center items-center py-2">
      <Week key={1} week={week_map[1]} week_number={1}/>
      <Week key={2} week={week_map[2]} week_number={2}/>
      <Week key={3} week={week_map[3]} week_number={3}/>
    </View>
    </Shadow>

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