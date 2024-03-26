import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const PublicLayout = () => {
  return (
    <>
    <StatusBar style="light" />
    <Stack
      screenOptions={{
        
        headerShown: true,
        headerStyle: {
            backgroundColor: "#090909", // Correct property for background color
            
        },
        headerBackTitleVisible: false,
        headerTintColor: '#fff'
      }}>
      <Stack.Screen
        name="login"
        options={{   
          headerTitle: 'goodwager',
        }}></Stack.Screen>
      <Stack.Screen
        name="register"
        options={{
          headerTitle: 'Create Account',
        }}></Stack.Screen>
      <Stack.Screen
        name="reset"
        options={{
          headerTitle: 'Reset Password',
        }}></Stack.Screen>
    </Stack>
    </>
  );
};

export default PublicLayout;
