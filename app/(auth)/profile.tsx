import { View, Text, Pressable, Modal, StyleSheet, Image, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useEffect, useState, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { Shadow } from 'react-native-shadow-2';
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import { Ionicons } from '@expo/vector-icons';
import supabaseClient from '../utils/supabase';
import { fetchUserFromUsername } from '../utils/clerk_apis';

const Profile = () => {
  const { user } = useUser();
  const { signOut, getToken, userId } = useAuth();
  
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [allWagers, setAllWagers] = useState([]);
  const [amountDonated, setAmountDonated] = useState(0);
  const [modalUnfriendVisible, setModalUnfriendVisible] = useState(false);
  const [modalAddFriendVisible, setModalAddFriendVisible] = useState(false);
  const [selecteUser, setSelectedUser] = useState(null);
  const [isSignOutModalVisible, setIsSignOutModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [followers, setFollowers] = useState([]);

  const fetchWagerData = useCallback(async () => {
    const token = await getToken({ template: 'supabase' });
    const supabase = supabaseClient(token);
    const { data, error } = await supabase
      .from('wagers')
      .select('*')
      .eq('user_id', userId);
    if (error) {
      console.error('Error fetching all wagers for profile:', error);
    }
    if (data.length > 0) {
      setAllWagers(data);
      const failed = data.filter(wager => wager.status === "failed");
      setAmountDonated(failed.reduce((accumulator, current) => {
        return accumulator + current.amount;
      }, 0));
    }
  }, [getToken, userId]);

  const fetchFriends = useCallback(async () => {
    const token = await getToken({ template: 'supabase' });
    const supabase = supabaseClient(token);
    const { data, error } = await supabase
      .from('followers')
      .select()
      .eq('follower', userId);
    if (error) {
      console.error('Error fetching friends:', error);
    } else {
      setFollowers(data || []);
    }
  }, [getToken, userId]);

  useEffect(() => {
      fetchWagerData();
      fetchFriends();
    }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchWagerData(), fetchFriends()]);
    setRefreshing(false);
  }, [fetchWagerData, fetchFriends]);

  const onSaveUser = async () => {
    try {
      // This is not working!
      const result = await user.update({
        firstName: 'John',
        lastName: 'Doe',
      });
      console.log('🚀 ~ file: profile.tsx:16 ~ onSaveUser ~ result:', result);
    } catch (e) {
      console.log('🚀 ~ file: profile.tsx:18 ~ onSaveUser ~ e', JSON.stringify(e));
    }
  };

  const StatDisplay = ({ color, stat, is_money }) => {
    return (
      <View className='flex-col h-fit w-fit space-y-1'>
        <Shadow startColor={'#050505'} distance={5} style={{borderRadius:12}}>
          <View style={{borderColor: color}} className='flex justify-center items-center h-14 w-14 border  rounded-xl'>
            <Svg height="100%" width="100%" >
                <Defs>
                    <RadialGradient id="grad" cx="50%" cy="50%" r="100%" fx="50%" fy="50%">
                        <Stop offset="43%" stopColor="#0D0D0D" stopOpacity="1" />
                        <Stop offset="100%" stopColor={color} stopOpacity="1" />
                    </RadialGradient>
                
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" rx={11} ry={11}/>
                <View className="flex h-full w-full justify-center items-center ">
                    <Text style={{color: color}}>
                      {is_money ? "$" : "" }{stat}
                    </Text>
                </View>
            </Svg>
          </View>
        </Shadow>
      </View>
    );
  }

  function onRemoveFriend(id) {
    console.log('Removing friend with id:', id);
  }

  const FriendItem = ({ friend, onDelete }) => {
    const [follower_data, setFollowerData] = useState(null);
    useEffect(() => {
      async function fetchData() {
        const data = await fetchUserFromUsername(friend.followee_un, await getToken({ template: 'supabase' }));
        setFollowerData(data[0]);
      }
      fetchData();
    }
    , []);
    if (!follower_data) {
      return null;
    }
    return (
        <View className="flex-row w-full h-20 justify-between items-center px-4 border-b rounded-3xl border-neutral-800">
              <View className='flex h-11 w-11 rounded-full p-0.5 border border-neutral-400 justify-center items-center'>
                <Image source={{uri: follower_data.image_url}} style={{width: "100%", height: "100%", borderRadius: 50}} />
              </View>
              <View className="flex-col space-y-1 items-center">
                <Text style={{color: "#fff"}} className="text-lg">{follower_data.first_name} {follower_data.last_name}</Text>
                <Text style={{fontSize:12}} className="text-neutral-500">@{follower_data.username}</Text>
              </View>
            <TouchableOpacity
              className='flex-row justify-center items-center h-fit w-fit px-1 py-1 border border-neutral-800 rounded-xl'
              onPress={() => {setModalUnfriendVisible(true); setSelectedUser(follower_data)}}
            >
              <Ionicons name="close-outline" size={18} color="rgb(115 115 115)" />
            </TouchableOpacity>

            {/* Confirmation modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalUnfriendVisible}
                onRequestClose={() => {setModalUnfriendVisible(false); setSelectedUser(null)}}
              >
                <View className="flex-1 justify-center items-center m-4">
                  <View className="flex p-5 rounded-xl border border-neutral-800 bg-neutral-600 justify-center items-center">
                    {selecteUser && <Text className='text-neutral-400'>Remove @{selecteUser.username}?</Text>}
                    <View className="flex-row justify-center items-center space-x-4">
                      <Pressable className="p-2" onPress={() => { setSelectedUser(null); setModalUnfriendVisible(false); }}>
                        <Text className="text-white text-center">Cancel</Text>
                      </Pressable>
                      <Pressable className="p-2" onPress={() => { onDelete(friend.id); setModalUnfriendVisible(false); }}>
                        <Text className="text-white text-center">Confirm</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
            </Modal>
        </View>
    );
  };

  const FriendList = () => {
    const onDelete = (friendId) => {
      setFollowers((currentFollowers) => currentFollowers.filter((friend) => friend.id !== friendId));
    };

    if (followers.length === 0 && !refreshing) {
      return (
        <View style={{minWidth: '100%', backgroundColor: '#0D0D0D'}} className='flex-row w-full h-3/5 justify-center items-center border rounded-xl border-neutral-800'>
          <Text style={{color: '#d4d4d4'}}>No friends yet</Text>
        </View>
      );
    }

    if (refreshing) {
      return (
        <View style={{minWidth: '100%', backgroundColor: '#0D0D0D'}} className='flex-row w-full h-3/5 justify-center items-start pt-10 border rounded-xl border-neutral-800'>
          <Text style={{color: '#404040'}}>Loading...</Text>
        </View>
      );
    }

    return (
      <View className='flex-row w-full h-3/5 justify-center items-center'>
        <Shadow startColor={'#050505'} distance={2} style={{borderRadius:12}}>
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{alignItems: 'center', paddingBottom:5}} 
            className='flex-1 pb-0.5 px-1 w-full h-full border rounded-xl border-neutral-800'
            style={{minWidth: '100%', backgroundColor: '#0D0D0D'}}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#d4d4d4" // Color of the refresh indicator
              />
            }
          >
            {followers.map((follower) => (
              <FriendItem key={follower.followee} friend={follower} onDelete={onDelete} />
            ))}
          </ScrollView>
        </Shadow>
      </View>
    );
  };

  const handleSignOut = () => {
    setIsSignOutModalVisible(true);
  };

  const confirmSignOut = () => {
    setIsSignOutModalVisible(false);
    signOut();
  };

  return (
    <View style={{backgroundColor: "#090909"}} className='w-full h-full flex-col justify-between items-center px-4 pt-24 '>
      <View className="flex-col h-1/3 w-full justify-start items-start ">
        
        {/* User info */}
        <View className="flex-col h-1/4 w-full justify-center items-start">
          <View className="flex-row h-full w-full justify-between items-center">
            <View className='flex-row space-x-4'>
              <View className='flex h-11 w-11 rounded-full p-0.5 border border-neutral-400 justify-center items-center'>
                <Image source={{uri: user.imageUrl}} style={{width: "100%", height: "100%", borderRadius: 50}} />
              </View>
              <View className='flex-col justify-center items-center'>
                <View className="flex-row w-full space-x-1">
                  <Text style={{color: "#fff"}} className='text-xl'>{user.firstName}</Text>
                  <Text style={{color: "#fff"}} className='text-xl'>{user.lastName}</Text>
                </View>
                <View className="flex-row items-start justify-start w-full">
                  <Text className='text-xs text-neutral-400'>@{user.username}</Text>
                </View>
              </View>
            </View>
            {/* Sign out */}
            <View className="flex-col flex-1 justify-center items-end">
              <Pressable className="flex justify-center items-center h-11 w-11" onPress={handleSignOut}>
                <Ionicons name="log-out-outline" size={36} color={'rgb(115 115 115)'} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* User stats */}
        <View className="flex-col w-full h-3/4 justify-center items-center">
          <View className="flex-row w-full h-fit py-2 pl-1 justify-between items-center">
            <Text style={{fontSize: 12}} className="text-white font-semibold">Stats</Text>
          </View>
          <Shadow startColor={'#050505'} distance={4} style={{borderRadius: 12}}>
            <View style={{backgroundColor: "#0D0D0D"}} className='flex-row w-full h-24 border-neutral-800 rounded-xl border justify-between px-4 items-center'>
              <View className="flex-col w-fit h-fit items-center space-y-1">
                <StatDisplay color="rgb(251 191 36)" stat={allWagers.length} is_money={false}/>
                <Text style={{fontSize: 8}} className="text-white font-semibold">Wagers</Text>
              </View>
              <View className="flex-col justify-center items-center space-y-1">
                < StatDisplay color="#00ff00" stat={allWagers.filter(wager => wager.status === "completed").length} is_money={false}/>
                <Text style={{fontSize: 8}} className="text-white font-semibold">Completed</Text>
              </View>
              <View className="flex-col justify-center items-center space-y-1">
              < StatDisplay color="#FB7183" stat={amountDonated} is_money={true}/>
                <Text style={{fontSize: 8}} className="text-white font-semibold">Donated</Text>
              </View>
            </View>
          </Shadow>
        </View>
      </View>

      {/* Friends list */}
      <View className="flex-col w-full h-3/4 justify-center items-center">
          <View className="flex-row w-full h-fit py-2 px-1 justify-between items-center">
            <Text style={{fontSize: 12}} className="text-white font-semibold">Manage Friends</Text>
          </View>
          <FriendList />
      </View>

      {/* Sign out confirmation modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isSignOutModalVisible}
        onRequestClose={() => setIsSignOutModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-neutral-800 p-5 rounded-xl w-4/5 max-w-sm">
            <Text className="text-white text-lg mb-4 text-center">Are you sure you want to sign out?</Text>
            <View className="flex-row justify-around">
              <Pressable 
                className="bg-neutral-600 px-4 py-2 rounded-lg"
                onPress={() => setIsSignOutModalVisible(false)}
              >
                <Text className="text-white">Cancel</Text>
              </Pressable>
              <Pressable 
                className="bg-red-600 px-4 py-2 rounded-lg"
                onPress={confirmSignOut}
              >
                <Text className="text-white">Sign Out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 40,
    backgroundColor: "#090909",
  },
  inputField: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderColor: '#6c47ff',
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#fff',
  },
});

export default Profile;
