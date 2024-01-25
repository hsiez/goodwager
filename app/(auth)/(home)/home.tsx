import { View, Text, Pressable, Modal, TouchableOpacity, ScrollView } from 'react-native';
import React, {useState} from 'react';
import { useUser } from '@clerk/clerk-expo';
import CurrentWager from '../../components/current-wager';
import * as Localization from 'expo-localization';
import { Link } from "expo-router";


// function that fetches the user's current wager
function getCurrentWager(userId) {
//   const { user } = useUser();
//   const wager = user.privateMetadata.wager;
//   return wager;
  return null;
}

const ManageWager = ({ activeWager }: { activeWager: boolean }) => {
  if (activeWager) {
    return (
      <Link href="/other" asChild>
              <Pressable>
                <Text>Manage Wager</Text>
              </Pressable>
      </Link>
    );
  } else {
    return (
      <Link push href="/create" asChild>
                <Pressable className='bg-zinc-700 rounded-md border-2 pr-4 pl-4 pt-2 pb-2'>
                  <Text className='text-white'>Create Wager</Text>
                </Pressable>
        </Link>
    );
  }
}
const Home = () => {
  const [hasActiveWager, setHasActiveWager] = useState(false);
  const { user } = useUser();
  const tzone = Localization.getCalendars()[0].timeZone;
  const wager = getCurrentWager(user.id);



  return (
    <View className="h-full bg-neutral-900">
      <View className='flex justify-center items-center'>
        <View className="justify-start mt-20">
          <Text className="text-3xl text-gray-100 mb-20"> Welcome, Harley</Text>
        </View>

        {/* Current Wager */}
          <CurrentWager stakes={null} status={'noWager'} charity={null} />
          <ManageWager activeWager={hasActiveWager} />
      </View>
    </View>
  );
};

export default Home;
