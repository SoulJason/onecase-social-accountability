import React, { useState, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import OneCase from '../assets/images/onecase.svg';
import Button from '../../components/Button';
import PhoneInput from 'react-native-phone-number-input';
import CodeField from '../../components/CodeField/CodeField';
import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { useStateValue } from './store/StateProvider';
import { StackParamList } from '../../navigation/CreateAccountStack';
import { createUser } from '../../lib/supabase/store';
import supabase from '../../lib/supabase';
import apiCaller from '../../utils/apiCaller';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'VerifyPhone'>;
  route: RouteProp<StackParamList, 'VerifyPhone'>;
}

function VerifyPhoneScreen({ navigation, route }: Props) {
  const { phone } = route.params;
  const { state } = useStateValue();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const verifyNumber = async () => {
    setLoading(true);
    try {
      const response = await apiCaller.post('/verify', {
        phone,
        token,
      });
      if (response.status === 200) {
        await createUser(response.data.userId, state);
        setLoading(false);
        await supabase.auth.signIn({
          refreshToken: response.data.refreshToken,
        });
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <View style={{ marginBottom: 50 }}>
          <Text style={styles.prompt}>Enter the verification code.</Text>
          <CodeField onChange={setToken} />
        </View>
      </View>
      <View style={styles.bottom}>
        <Button type='info' disabled={loading} onPress={verifyNumber}>
          Continue
        </Button>
      </View>
    </View>
  );
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 30,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottom: {
    justifyContent: 'center',
    marginBottom: 40,
    alignItems: 'center',
    marginHorizontal: 30,
  },
  prompt: {
    fontSize: '$heading',
    fontFamily: '$normalFont',
    marginBottom: 50,
    textAlign: 'center',
  },
  inputContainer: {
    borderRadius: 10,
    width: '85%',
    marginBottom: 20,
  },
  input: {
    borderRadius: 10,
    backgroundColor: '#F8F9F9',
    width: '95%',
  },
});

export default VerifyPhoneScreen;
