import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';

const fetchUsersByUsername = async (username) => {
  // Placeholder for your search logic
  // This could be an API call to your backend
  console.log(`Searching for users with username: ${username}`);
  // For demonstration, returning a mock user with a profile picture
  return [{ id: '1', username: username, name: 'John Doe', profilePic: 'https://via.placeholder.com/150' }];
};

const sendFollowRequest = (userId) => {
  // Placeholder for your friend request logic
  // This could be an API call to your backend
  console.log(`Sending friend request to user ID: ${userId}`);
  alert('Friend request sent!');
};

const checkFriendshipStatus = (friendshipStatus) => {
    switch (friendshipStatus) {
      case 'not_friends':
        return 'Send Friend Request';
      case 'pending':
        return 'Request Pending';
      case 'friends':
        return 'Already Friends';
      default:
        return 'Unknown';
    }
  };

const UserSearch = () => {
    const [username, setUsername] = useState('');
    const [searchResults, setSearchResults] = useState([]);

  const onSearch = async () => {
    if (username.trim() === '') {
      alert('Please enter a username to search.');
      return;
    }
    const results = await fetchUsersByUsername(username);
    setSearchResults(results);
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Enter username"
        style={styles.input}
        onSubmitEditing={onSearch} // Trigger search on return key press
        returnKeyType="search"
      />
      {searchResults.length > 0 && (
        <View style={styles.resultsContainer}>
          {searchResults.map(user => (
            <View key={user.id} style={styles.userItem}>
              <Image source={{ uri: user.profilePic }} style={styles.profilePic} />
              <Text style={styles.username}>{user.name} (@{user.username})</Text>
              <TouchableOpacity style={styles.button} onPress={() => sendFollowRequest(user.id)}>
                <Text style={styles.buttonText}>Follow</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  resultsContainer: {
    marginTop: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  username: {
    flex: 1,
  },
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#ffffff',
  },
});

export default UserSearch;