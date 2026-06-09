import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Button from '../../components/Button';

import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { Input } from 'react-native-elements';
// import { useStateValue } from './store/StateProvider';
// import { ActionType } from './store/actions';
import { StackParamList } from '../../navigation/OnboardStack';
import CreateProfileTemplate from '../../components/CreateProfileTemplate';
import PressableText from '../../components/PressableText';

import * as Contacts from 'expo-contacts';
import Toast from 'react-native-toast-message';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Contacts'>;
  route: RouteProp<StackParamList, 'Contacts'>;
}

function ContactsScreen({ navigation }: Props) {
  const getContactsAccess = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      navigation.navigate('ProfilePicture');
    } else {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Failed to give access!',
        text2: 'Please allow access if you want to find your friends!',
        topOffset: 50,
      });
    }
  };

  return (
    <CreateProfileTemplate>
      <View style={styles.main}>
        <View style={{ marginBottom: 40 }}>
          <Text style={styles.prompt}>
            Allow access to Contacts to find your friends
          </Text>
          <Text style={styles.description}>
            The app is literally centered around friends holding you
            accountable!
          </Text>
        </View>
      </View>
      <View style={styles.bottom}>
        <Button type='info' onPress={getContactsAccess} style={styles.button}>
          Give Access
        </Button>
        <PressableText
          style={styles.skip}
          onPress={() => navigation.navigate('ProfilePicture')}
        >
          Skip
        </PressableText>
      </View>
    </CreateProfileTemplate>
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
    // alignItems: 'center',
  },
  bottom: {
    justifyContent: 'center',
    marginBottom: 40,
    alignItems: 'center',
    marginHorizontal: 30,
  },
  prompt: {
    fontSize: '$heading',
    fontFamily: '$semiboldFont',
    marginBottom: 50,
    textAlign: 'center',
  },
  description: {
    color: '#4F4F4F',
    textAlign: 'center',
    fontSize: 17,
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
  skip: {
    marginTop: 10,
  },
});

export default ContactsScreen;
