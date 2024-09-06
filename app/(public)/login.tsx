import { useOAuth, useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, TextInput, KeyboardAvoidingView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';;

const Login = () => {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { signIn, setActive } = useSignIn();
  const router = useRouter();
  const [loadingEmailPassword, setLoadingEmailPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const onGooglePress = async () => {
    try {
      setLoading(true);
      const { createdSessionId, signIn, signUp } = await startOAuthFlow();
      
      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        router.replace("/(auth)/wager");
      } else {
        console.log("No session created");
      }
    } catch (err) {
      console.error("OAuth error", err);
    } finally {
      setLoading(false);
    }
  };

  const onEmailPasswordPress = async () => {
    try {
      setLoadingEmailPassword(true);
      setErrorMessage('');
      const result = await signIn.create({
        identifier: email,
        password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/(auth)/wager");
      }
    } catch (err) {
      console.error("Sign in error", err);
      setErrorMessage('Invalid email or password');
    } finally {
      setLoadingEmailPassword(false);
    }
  };

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View className="flex-1 justify-center p-5 bg-[#090909]">
      <View className="flex-col w-full justify-center items-center space-y-6">
        <Animated.View 
          className=" items-center"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text className="text-3xl font-bold text-neutral-200">Welcome to goodwager</Text>
          <Text className="text-lg text-green-500 italic">Ante Up</Text>
        </Animated.View>

        <KeyboardAvoidingView behavior="padding" enabled className="flex-col w-full justify-center items-center space-y-2">
          <TextInput
            className="bg-neutral-800 w-full p-3 rounded-full text-neutral-300"
            placeholder="Email or Username"
            placeholderTextColor="#737373"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <TextInput
            className="bg-neutral-800 w-full p-3 rounded-full text-neutral-300"
            placeholder="Password"
            placeholderTextColor="#737373"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {errorMessage ? (
            <Text className="text-neutral-500 text-sm mb-2">{errorMessage}</Text>
          ) : null}
          <TouchableOpacity 
            onPress={onEmailPasswordPress} 
            className="bg-green-500 flex-row items-center justify-center p-3 rounded-full w-full shadow-md"
            disabled={loading}
          >
            <Text className="text-white font-medium text-base">
              {loadingEmailPassword ? 'Signing in...' : 'Sign in'}
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
        <TouchableOpacity 
          onPress={onGooglePress} 
          className="bg-white flex-row items-center justify-center p-3 rounded-full w-full shadow-md space-x-2"
          disabled={loading}
        >
          <Ionicons name="logo-google" size={24} color="#000" />
          <Text className="text-gray-700 font-medium text-base">
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </Text>
        </TouchableOpacity>
      </View>
      <Link href="/register" asChild>
        <TouchableOpacity className="items-center mt-4">
          <Text className="text-neutral-400">Create Account</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default Login;
