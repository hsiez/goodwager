import { View, KeyboardAvoidingView, Platform, TouchableOpacity, Text, TextInput, Image } from 'react-native';
import { useOAuth, useSignUp } from '@clerk/clerk-expo';
import { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Register = () => {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { signUp, setActive } = useSignUp();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onPress = async () => {
    try {
      setLoading(true);
      const { createdSessionId, signUp } = await startOAuthFlow();

      if (signUp) {
        setShowUsernameInput(true);
      } else if (createdSessionId) {
        setActive({ session: createdSessionId });
        router.push("/(auth)/wager");
      }
    } catch (err) {
      console.error("OAuth error", err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitUsername = async () => {
    if (!signUp) return;
    try {
      setLoading(true);
      setErrorMessage('');
      const completeSignUp = await signUp.update({
        username,
      });
      if (completeSignUp.createdSessionId) {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace("/(auth)/wager");
      }
    } catch (err: any) {
      console.error("Error setting username", err);
      setErrorMessage(err.errors?.[0]?.message || "An error occurred while setting the username.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 justify-center p-5 bg-[#090909]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ headerBackVisible: true }} />

      <View className="w-full items-center">
        {!showUsernameInput ? (
          <TouchableOpacity 
            onPress={onPress} 
            className="bg-white flex-row items-center justify-center p-3 rounded-full w-full my-2.5 shadow-md space-x-2"
            disabled={loading}
          >
            <Ionicons name="logo-google" size={24} color="#000" />
            <Text className="text-gray-700 font-medium text-base">
              {loading ? 'Creating account...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            {errorMessage ? (
              <Text className="text-red-500 mb-2.5 text-center w-full">{errorMessage}</Text>
            ) : null}
            <TextInput
              className="bg-[#1A1A1A] text-white w-full p-4 rounded-xl mb-2.5"
              placeholder="Choose a username"
              placeholderTextColor="#6B7280"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              onPress={onSubmitUsername} 
              className="bg-[#4CAF50] p-4 rounded-xl w-full"
              disabled={loading}
            >
              <Text className="text-white text-center font-bold text-base">
                {loading ? 'Submitting...' : 'Submit Username'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default Register;
