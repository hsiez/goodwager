import { Button, TextInput, View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import Spinner from 'react-native-loading-spinner-overlay';
import { useState } from 'react';
import { Stack } from 'expo-router';
import * as Localization from 'expo-localization';
import { Shadow } from 'react-native-shadow-2';

const Register = () => {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Create the user and send the verification email
  const onSignUpPress = async () => {
    if (!isLoaded) {
      return;
    }
    setLoading(true);

    try {
      const tzone = Localization.getCalendars()[0].timeZone;
      // Create the user on Clerk
      await signUp.create({
        username,
        firstName,
        lastName,
        emailAddress,
        password,
        unsafeMetadata: { timeZone: tzone }
      });

      // Send verification Email
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // change the UI to verify the email address
      setPendingVerification(true);
    } catch (err: any) {
      console.log(err[0]);
      alert(err.errors[0].message);
    } finally {
      setLoading(false);
    }
  };

  // Verify the email address
  const onPressVerify = async () => {
    if (!isLoaded) {
      return;
    }
    setLoading(true);

    try {
      console.log('Verifying email address');
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      console.log('Email address verified');

      await setActive({ session: completeSignUp.createdSessionId });
    } catch (err: any) {
      alert(err.errors[0].message);
    } finally {
      setLoading(false);


    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Stack.Screen options={{ headerBackVisible: !pendingVerification }} />
      <Spinner visible={loading} />

      {!pendingVerification && (
        <>
          <Shadow startColor={'#050505'} distance={4} style={{borderRadius: 12}}>
          <View style={{backgroundColor: "#0D0D0D"}} className='flex-col w-full h-fit px-2 py-4 border border-neutral-800 rounded-2xl'>
            
            <View className='flex-row w-full justify-between'>
              <TextInput className="flew-row w-40 border border-neutral-800 rounded-xl text-neutral-300" autoCapitalize="none" placeholder="first name" placeholderTextColor={"rgb(64 64 64)"} value={firstName} onChangeText={setFirstName} style={styles.inputField} />
              <TextInput className="flew-row w-40 border border-neutral-800 rounded-xl text-neutral-300" autoCapitalize="none" placeholder="last name" placeholderTextColor={"rgb(64 64 64)"} value={lastName} onChangeText={setLastName} style={styles.inputField} />
            </View>
            <TextInput className="border border-neutral-800 rounded-xl text-neutral-300" autoCapitalize="none" placeholder="example@email.com" placeholderTextColor={"rgb(64 64 64)"} value={emailAddress} onChangeText={setEmailAddress} style={styles.inputField} />
            <TextInput className="border border-neutral-800 rounded-xl text-neutral-300" autoCapitalize="none" placeholder="username" placeholderTextColor={"rgb(64 64 64)"} value={username} onChangeText={setUsername} style={styles.inputField} />
            <TextInput className="border border-neutral-800 rounded-xl text-neutral-300" placeholder="password" placeholderTextColor={"rgb(64 64 64)"} value={password} onChangeText={setPassword} secureTextEntry style={styles.inputField} />
          </View>
          </Shadow>

          <Button onPress={onSignUpPress} title="Sign up" color={"rgb(212 212 212)"}></Button>
        </>
      )}

      {pendingVerification && (
        <>
          <View>
            <TextInput className="border border-neutral-800 rounded-xl text-neutral-300" value={code} placeholder="Code..." placeholderTextColor={"rgb(64 64 64)"} style={styles.inputField} onChangeText={setCode} />
          </View>
          <Button onPress={onPressVerify} title="Verify Email" color={'rgb(212 212 212)'}></Button>
        </>
      )}
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
    marginVertical: 4,
    height: 50,
    padding: 10,
    backgroundColor: '#0D0D0D',
  },
  button: {
    margin: 8,
    alignItems: 'center',
  },
});

export default Register;
