import React, { useEffect, useState } from 'react';
import { View, TextInput, Pressable, Image, FlatList, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Make sure you have expo/vector-icons installed
import { fetchUserFromUsername } from '../utils/clerk_apis';
import { useAuth } from '@clerk/clerk-expo';
import supabaseClient from '../utils/supabase';


const FollowButton = ({ alreadyFollowed, handleFollow }) => {
  return (
    <Pressable onPress={handleFollow}>
      {alreadyFollowed ? (
        <View className='flex h-5 w-14 justify-end items-end'>
          <Ionicons name="checkmark" size={20} color="#00ff00" />
        </View>
      ) : (
        <View className='flex h-5 w-14 px-2 rounded-lg border-neutral-800 border justify-center'>
          <Text style={{fontSize: 12, color: "#fff"}} className="text-neutral-300">Follow</Text>
        </View>
      )}
    </Pressable>
  );
};

const SearchBar = () => {
  const { userId, getToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [following, setFollowing] = useState(new Set());

  const handleFollow = async (followeeId) => {
    const token = await getToken({ template: 'supabase' });
    const supabase = supabaseClient(token);
    const { error } = await supabase
      .from('followers')
      .insert([{ follower: userId, followee: followeeId, followee_un: searchResults[0].username }]);
    if (!error) {
      setFollowing((prev) => new Set(prev).add(followeeId));
    }
  };

  const handleSubmitEditing = async () => {
    const token = await getToken({ template: 'supabase' });
    const results = await fetchUserFromUsername(searchQuery, token);
    setSearchResults(results);
    const supabase = supabaseClient(token);
    const { data: followData } = await supabase
      .from('followers')
      .select('followee')
      .eq('follower', userId)
      .in('followee', results.map(r => r.user_id));
    const newFollowing = new Set(followData.map(f => f.followee));
    setFollowing(newFollowing);
  };

  return (
    <View className="flex-col w-full items-center px-3">
      <TextInput
        placeholder="Search username..."
        placeholderTextColor="rgb(64 64 64)"
        value={searchQuery}
        onChangeText={setSearchQuery}
        className="flex w-full h-8 bg-neutral-800 text-neutral-300 rounded-full px-3 py-2"
        returnKeyType="search"
        onSubmitEditing={handleSubmitEditing}
        clearButtonMode="while-editing"
        keyboardAppearance="dark"
      />
      <FlatList
        data={searchResults}
        renderItem={({ item }) => (
          <View className='flex-row w-full h-fit py-3 px-1 justify-between items-center'>
            <View className='flex h-10 w-10 rounded-full p-0.5 border border-neutral-400 justify-center items-center'>
                <Image source={{uri: item.image_url}} style={{width: "100%", height: "100%", borderRadius: 50}} />
            </View>
            <Text className='text-neutral-300'>{item.first_name} {item.last_name}</Text>
            <FollowButton alreadyFollowed={following.has(item.user_id)} handleFollow={() => handleFollow(item.user_id)} />
          </View>
        )}
        keyExtractor={item => item.user_id}
        className='flex-col h-3/5 w-full mt-2 px-3 border border-neutral-800 rounded-2xl'
      />
    </View>
  );
};

export default SearchBar;