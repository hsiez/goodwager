import React, { useState, useEffect } from 'react';
import { Pressable, Text, View, TouchableOpacity } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const weeks = [[1, 7], [8, 14], [15, 21]];


type Workout = {
  calories: string;
  created_at: string;
  date: string;
  id: number;
  type: string;
  user_id: string;
  wager_id: string;
  duration: number
};

type Workouts = Array<Workout>;

const WagerCalendar = ({ start_date, select_day, selected_day, last_completed_day, wager_status }: { start_date: Date, select_day: Function, selected_day, last_completed_day:string, wager_status: string  }) => {
  const [wagerActive, setWagerActive] = useState( wager_status !== "failed");
  const [wagerTrackerData, setWagerTrackerData] = useState({});
  const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

  useEffect(() => {
    async function setUpCalendar() {
        console.log("Setting up calendar");
        const workoutDataFlat = {};
        for (let i = 0; i < 21; i++) {
          const result = new Date(start_date || today);
          result.setDate(result.getDate() + i);
          workoutDataFlat[result.toISOString()] = {
            challengeDay: i + 1,
          };
        }
        setWagerTrackerData(workoutDataFlat);
      console.log("last_completed_day", last_completed_day);
    }

    setUpCalendar();
  }, [start_date, selected_day, last_completed_day]); // Added `workouts` as a dependency

  const workoutEntries = Object.entries(wagerTrackerData);
  const week_map = {
    1: workoutEntries.slice(0, 7),
    2: workoutEntries.slice(7, 14),
    3: workoutEntries.slice(14, 21)
  };

  const SingleDay = ({ week, index }) => {
    const date = index[0];
    const data = index[1];
    const [workoutDay, setWorkoutDay] = useState([0, 0]);
    const [borderInfo, setBorderInfo] = useState("");
    const [numberBg, setNumberBg] = useState('');
    const [numberTextColor, setNumberTextColor] = useState('#262626');
    const [dayCompleted, setDayCompleted] = useState(false);
    const [icon, setIcon] = useState<'ellipse-outline' | 'checkmark-done-circle-outline'>('ellipse-outline');
    const [iconColor, setIconColor] = useState('#262626');   

    useEffect(() => {
      if (data.challengeDay < 10) {
        setWorkoutDay([0, data.challengeDay]);
      } else {
        setWorkoutDay([Math.floor(data.challengeDay / 10), data.challengeDay % 10]);
      }

      if (date > today || wagerActive === false) {
        return;
      }
      if (date <= today) {
        setNumberTextColor("#e5e5e5");
      }
      if (selected_day === date) {
        setBorderInfo("border-neutral-500 border");
        setNumberTextColor("#e5e5e5");
      } else {
        setBorderInfo("");
      }
      
      console.log("last_completed_dayyyyyy", new Date(last_completed_day).toISOString(), date);
      if (wagerActive) {
        if (date <= new Date(last_completed_day).toISOString()) {
          console.log("Day completed", date);
          setDayCompleted(true);
          setIcon('checkmark-done-circle-outline');
          setIconColor('#00ff00');
          console.log("Day completed", date);
        } else if  ( date > new Date(last_completed_day).toISOString()) {
          setDayCompleted(false);
          setIcon('ellipse-outline');
          setIconColor('#e5e5e5');
        }
      }

    }, [selected_day, last_completed_day ]);
    const handleCellPress = () => {
      select_day(date);
    };

    return (
      <View className="">
        <TouchableOpacity
          key={`${week}-${date}`}
          onPress={handleCellPress}
          className={`flex justify-center rounded-lg h-11 w-11 p-1 ${borderInfo}`}
          disabled={!wagerActive || date > today}
        >
          <View key={data.challengeDay} className="flex h-full w-full">
            <View style={{ paddingVertical: 0.5 }} className={`flex-col w-full justify-center items-center rounded`}>
              <View className="flex justify-center items-center">
                <Ionicons name={icon} size={24} color={iconColor} />
              </View>
              <View className="flex-row h-fit w-fit justify-center items-center space-x-0.5">
                <View className={`flex justify-center items-center rounded h-4 w-2 ${numberBg}`}>
                  <Text style={{ fontSize: 10, color: numberTextColor }} className={`font-bold`}>{workoutDay[0]}</Text>
                </View>
                <View className={`flex justify-center items-center rounded h-4 w-2 ${numberBg}`}>
                  <Text style={{ fontSize: 10, color: numberTextColor }} className={`font-bold`}>{workoutDay[1]}</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  const Week = ({ week, week_number, bg_color }) => {
    return (
      <View style={{backgroundColor: bg_color}} className="flex-row w-full h-fit justify-between items-center rounded-lg">
        {week.map((index) => (<SingleDay key={index} week={week_number} index={index} />))}
      </View>
    );
  }

  return (
    <View className='flex-col h-full w-full justify-center items-center py-2'>
        <View className="flex-col h-full w-full justify-between items-center">
          <Week key={1} week={week_map[1]} week_number={1} bg_color={""}/>
          <Week key={2} week={week_map[2]} week_number={2} bg_color={"#0D0D0D"}/>
          <Week key={3} week={week_map[3]} week_number={3} bg_color={""}/>
        </View>
    </View>
  );
};

export default WagerCalendar;
