import React, { useState } from 'react';
import supabase from '../lib/supabase';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Ionicons } from '@expo/vector-icons';
import OneCase from '../assets/images/onecase.svg';
import { fetchUser } from '../lib/supabase/store';

export default function Auth() {
  const [index, setIndex] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState('');

  const handleLogin = async (type: string, email: string, password: string) => {
    setLoading(type);
    const { error, user } =
      type === 'LOGIN'
        ? await supabase.auth.signIn({ email, password })
        : await supabase.auth.signUp({ email, password });
    if (!error && !user) Alert.alert('Check your email for the login link!');
    if (error) Alert.alert(error.message);
    setLoading('');
  };

  const getPassword = async () => {
    const user = await fetchUser('', email);
    if (user) {
      setIndex(2);
    } else {
      setIndex(1);
    }
  };

  interface ButtonProps {
    disabled?: boolean;
    onPress?: () => void;
  }

  const Button = ({ disabled, onPress }: ButtonProps) => (
    <Pressable style={styles.button} onPress={onPress}>
      <Ionicons name='arrow-forward-sharp' size={36} color='white' />
    </Pressable>
  );

  const screens = [
    <>
      <Text style={styles.prompt}>Procrastinating Ends Here</Text>
      <TextInput
        placeholder='Email'
        autoCapitalize='none'
        keyboardType='email-address'
        textContentType='emailAddress'
        autoCompleteType='email'
        style={styles.inputContainer}
        onChangeText={(text) => setEmail(text)}
      />

      <View
        style={{
          marginTop: 20,
          justifyContent: 'flex-end',
          flexDirection: 'row',
          width: '100%',
          marginRight: '15%',
        }}
      >
        <Button onPress={getPassword} />
      </View>
    </>,
    <>
      <Text style={styles.prompt}>
        Looks like you don't have an account yet. Enter a password!
      </Text>
      <TextInput
        placeholder='Password'
        autoCapitalize='none'
        secureTextEntry={true}
        textContentType='newPassword'
        autoCompleteType='password'
        style={styles.inputContainer}
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <Pressable onPress={() => setIndex(0)}>
        <Text>BACK</Text>
      </Pressable>
      <Button
        disabled={!!loading.length}
        onPress={() => handleLogin('SIGNUP', email, password)}
      />
    </>,
    <>
      <Text style={styles.prompt}>
        Looks like you already have an account. Enter your password!
      </Text>
      <TextInput
        placeholder='Password'
        autoCapitalize='none'
        secureTextEntry={true}
        textContentType='newPassword'
        autoCompleteType='password'
        style={styles.inputContainer}
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <Pressable onPress={() => setIndex(0)}>
        <Text>BACK</Text>
      </Pressable>
      <Button
        disabled={!!loading.length}
        onPress={() => handleLogin('LOGIN', email, password)}
      />
    </>,
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>OneCase</Text>
        <OneCase style={{ marginVertical: 12 }} />
        {screens[index]}
      </View>
      <View style={{ flex: 1 }} />
    </KeyboardAvoidingView>
  );
}

const styles = EStyleSheet.create({
  container: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: '$titleFont',
    color: '$blueberry',
    fontSize: 40,
  },
  prompt: {
    marginBottom: '8%',
    fontSize: '$body',
    fontFamily: '$normalFont',
    textAlign: 'center',
  },
  inputContainer: {
    borderRadius: 10,
    height: 40,
    paddingHorizontal: 10,
    width: '85%',
    backgroundColor: '#FFFFFF',
    elevation: 10,
  },
  input: {
    borderRadius: 10,
    backgroundColor: '#F8F9F9',
    width: '95%',
  },
  button: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '$grannySmithApple',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 24,
    marginRight: 5,
    fontWeight: '700',
  },
  bottomQuote: {
    color: 'white',
    position: 'absolute',
    bottom: '5%',
    // fontSize: RFPercentage(2.5),
    marginHorizontal: '8%',
    textAlign: 'center',
  },
  codeFieldRoot: {
    marginTop: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  cellRoot: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  cellText: {
    color: '#000',
    fontSize: 36,
    textAlign: 'center',
  },
  focusCell: {
    borderBottomColor: '#007AFF',
    borderBottomWidth: 2,
  },
});
