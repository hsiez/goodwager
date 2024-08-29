import { useOAuth } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { Ionicons } from '@expo/vector-icons';

const Login = () => {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onPress = async () => {
    try {
      setLoading(true);
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        setActive({ session: createdSessionId });
        router.push("/(auth)/wager");
      }
    } catch (err) {
      console.error("OAuth error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View 
      className="flex-1 justify-center p-5 bg-[#090909]"
    >
      <View className="flex-col w-full justify-center items-center">
        <View className="rounded-xl w-full mb-2">
          <TouchableOpacity 
            onPress={onPress} 
            className="bg-white flex-row items-center justify-center p-3 rounded-full w-full my-2.5 shadow-md space-x-2"
            disabled={loading}
          >
            <Ionicons name="logo-google" size={24} color="#000" />
            <Text className="text-gray-700 font-medium text-base">
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Link href="/register" asChild>
        <TouchableOpacity className="items-center">
          <Text className="text-neutral-700">Create Account</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default Login;
