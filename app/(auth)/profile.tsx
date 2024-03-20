import { View, Text, Pressable, Modal, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { Shadow } from 'react-native-shadow-2';
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import UserSearch from '../components/user_search';
import fetchUsernames from '../utils/get_usersnames';

const Profile = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [modalUnfriendVisible, setModalUnfriendVisible] = useState(false);
  const [modalAddFriendVisible, setModalAddFriendVisible] = useState(false);
  const [selecteUser, setSelectedUser] = useState(null);

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
        <Shadow startColor={'#050505'} distance={2} >
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

  const fake_friends = [  
    { id: '1', name: 'John Doe', pic: user.imageUrl, username: user.username },
    { id: '2', name: 'Jane Smithds', pic: user.imageUrl, username: user.username },
    { id: '3', name: 'John Doe', pic: user.imageUrl, username: user.username },
    { id: '4', name: 'Jane Smithds', pic: user.imageUrl, username: user.username },
    { id: '5', name: 'John Doe', pic: user.imageUrl, username: user.username },
    { id: '6', name: 'Jane Smithds', pic: user.imageUrl, username: user.username },
    { id: '7', name: 'John Doe', pic: user.imageUrl, username: user.username },
    { id: '8', name: 'Jane Smithds', pic: user.imageUrl, username: user.username },
    { id: '9', name: 'John Doe', pic: user.imageUrl, username: user.username },
    { id: '10', name: 'Jane Smithds', pic: user.imageUrl, username: user.username },
  ];

  function onRemoveFriend(id) {
    console.log('Removing friend with id:', id);
  }

  const FriendItem = ({ friend, onDelete }) => {
    return (
      <View className="flex-row w-full h-20 justify-between items-center mt-1 px-2 border rounded-xl border-neutral-800" style={{ backgroundColor: '#0D0D0D' }}>
          <View className='flex h-11 w-11 rounded-full p-0.5 border border-neutral-400 justify-center items-center'>
            <Image source={{uri: friend.pic}} style={{width: "100%", height: "100%", borderRadius: 50}} />
          </View>
          <View className="flex-col space-y-1 items-center">
            <Text style={{color: "#fff"}} className="text-lg">{friend.name}</Text>
            <Text style={{color: "#fff"}} className="text-xs">@{friend.username}</Text>
          </View>
          <TouchableOpacity
            className='flex-row justify-center items-center h-fit w-fit px-1 py-1 border border-neutral-800 rounded-lg'
            onPress={() => {setModalUnfriendVisible(true); setSelectedUser(friend)}}
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
    // Sample data for the list
    const [friends, setFriends] = useState(fake_friends);
  
    // The delete function
    const onDelete = (friendId) => {
      // Update the state to remove the friend
      setFriends((friends) => friends.filter((friend) => friend.id !== friendId));
      
      // If you have a backend to sync with, you would also send a request to delete the friend from the database
    };
    return (
      <View className='flex-row  w-full h-3/5 justify-center items-center'>
        <Shadow startColor={'#050505'} distance={2} >
        {/* The SwipeListView component from react-native-swipe-list-view 
        <SwipeListView
          data={friends}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-30}
          previewRowKey={'1'}
          previewOpenValue={-30}
          previewOpenDelay={1000}
          disableRightSwipe
          previewRepeat
          onRowDidOpen={(rowKey) => {
            console.log('This row opened', rowKey);
          }}
          className='border-neutral-800 rounded-xl border'
          style={{ backgroundColor: "#0D0D0D", height: "100%", width: "100%", paddingHorizontal: 8}}
        />
        */}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{alignItems: 'center', paddingBottom:5}} className='flex-col pb-0.5 px-1 w-full h-full border rounded-xl border-neutral-800'>
          {friends.map((friend) => (
            <FriendItem key={friend.id} friend={friend} onDelete={onDelete} />
          ))}
        </ScrollView>
        </Shadow>
      </View>
    );
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
            <View className="flex-row h-full w-fit p-2 justify-center items-start ">
              <Pressable onPress={() => {signOut()}}>
                <Ionicons name="log-out-outline" size={24} color={'rgb(115 115 115)'} />
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
                <StatDisplay color="rgb(251 191 36)" stat={0} is_money={false}/>
                <Text style={{fontSize: 8}} className="text-white font-semibold">Wagers</Text>
              </View>
              <View className="flex-col justify-center items-center space-y-1">
                < StatDisplay color="#00ff00" stat={0} is_money={false}/>
                <Text style={{fontSize: 8}} className="text-white font-semibold">Completed</Text>
              </View>
              <View className="flex-col justify-center items-center space-y-1">
              < StatDisplay color="#FB7183" stat={0} is_money={true}/>
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
            <Pressable onPress={async ()=>{setModalAddFriendVisible(true), await fetchUsernames("harleysiezar")}} className='flex-row px-4 py-1 border border-neutral-800 rounded-xl justify-center items-center'>
              <Text style={{fontSize: 8}} className="text-white font-semibold">Add</Text>
            </Pressable>
            {/* Confirmation modal */}
             <Modal
              animationType="slide"
              transparent={true}
              visible={modalAddFriendVisible}
              onRequestClose={() => {setModalAddFriendVisible(false); setSelectedUser(null)}}
            >
              <View className="flex-1 justify-center items-center m-4">
                <View className="flex p-5 rounded-xl border border-neutral-800 bg-neutral-600 justify-center items-center">
                  {selecteUser && <Text className='text-neutral-400'>Remove @{selecteUser.username}?</Text>}
                  <UserSearch />
                  <View className="flex-row justify-center items-center space-x-4">
                    <Pressable className="p-2" onPress={() => { setModalAddFriendVisible(false); }}>
                      <Text className="text-white text-center">Cancel</Text>
                    </Pressable>
                    <Pressable className="p-2" onPress={() => { setModalAddFriendVisible(false); }}>
                      <Text className="text-white text-center">Confirm</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
          <FriendList />
      </View>
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
