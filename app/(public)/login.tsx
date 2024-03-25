import { useSignIn } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Button, Pressable, Text, KeyboardAvoidingView, Platform } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import { Shadow } from 'react-native-shadow-2';

const Login = () => {
  const { signIn, setActive, isLoaded } = useSignIn();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignInPress = async () => {
    if (!isLoaded) {
      return;
    }
    setLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // This indicates the user is signed in
      await setActive({ session: completeSignIn.createdSessionId });
    } catch (err: any) {
      alert(err.errors[0].message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className='flex-col w-full justify-center items-center'>
        <View className='mb-2'>
          <Shadow startColor={'#050505'} distance={4} style={{borderRadius: 12}}>
          <TextInput className='flex-row w-80 border border-neutral-800 rounded-xl' autoCapitalize="none" placeholder="simon@galaxies.dev" value={emailAddress} onChangeText={setEmailAddress} style={styles.inputField} />
          </Shadow>
        </View>
        <Shadow startColor={'#050505'} distance={4} style={{borderRadius: 12}}>
        <TextInput className='flex-row w-80 border border-neutral-800 rounded-xl' placeholder="password" value={password} onChangeText={setPassword} secureTextEntry style={styles.inputField} />
        </Shadow>
      </View>
      <Button onPress={onSignInPress} title="Login" color={"rgb(212 212 212)"}></Button>

      <Link href="/reset" asChild>
        <Pressable style={styles.button}>
          <Text className='text-neutral-700'>Forgot password?</Text>
        </Pressable>
      </Link>
      <Link href="/register" asChild>
        <Pressable style={styles.button}>
          <Text className='text-neutral-700'>Create Account</Text>
        </Pressable>
      </Link>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#090909',
  },
  inputField: {
    flexDirection: 'row',
    height: 50,
    padding: 10,
    backgroundColor: '#0D0D0D',
  },
  button: {
    margin: 8,
    alignItems: 'center',
  },
});

export default Login;
