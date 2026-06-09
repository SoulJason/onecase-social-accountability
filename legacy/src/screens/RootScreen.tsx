import React from 'react';
import { View, Text, Pressable, ImageBackground } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import OneCase from '../assets/images/onecase.svg';
import Button from '../components/Button';

import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { SignOutStackParamList } from '../navigation/SignOutStack';
import { useMixpanel } from '../providers/MixpanelContext';
import AnimatedRootScreenBackground from '../components/AnimatedRootScreenBackground';

interface Props {
  navigation: StackNavigationProp<SignOutStackParamList, 'Initial'>;
  route: RouteProp<SignOutStackParamList, 'Initial'>;
}

function InitialScreen({ navigation }: Props) {
  const mixpanel = useMixpanel();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OneCase</Text>
      <OneCase style={{ marginVertical: 12 }} />
      <Text style={styles.prompt}>With your friends, you could...</Text>
      <AnimatedRootScreenBackground />

      <View style={styles.bottom}>
        <View style={{ flexDirection: 'row' }}>
          <Button
            type='primary'
            onPress={() => {
              mixpanel?.time_event('Created account');
              mixpanel?.track('Pressed sign up');
              navigation.navigate('CreateAccount');
            }}
          >
            Sign Up
          </Button>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.loginButton,
            {
              opacity: pressed ? 0.4 : 1.0,
            },
          ]}
          onPress={() => {
            mixpanel?.time_event('Logged in');
            mixpanel?.track('Pressed log in');
            navigation.navigate('Login');
          }}
        >
          <Text style={styles.loginText}>Log In</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 22,
    fontFamily: '$titleFont',
  },
  loginButton: {
    marginTop: 20,
  },
  loginText: {
    color: '#5D9CC9',
    fontSize: 20,
    fontFamily: '$semiboldFont',
  },
  inputContainer: {
    borderRadius: 10,
    width: '85%',
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
  bottom: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 30,
    marginTop: 20,
  },
});

export default InitialScreen;
