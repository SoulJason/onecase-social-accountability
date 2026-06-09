import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Button from '../../components/Button';

import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParamList } from '../../navigation/CreateAccountStack';
import { Input } from 'react-native-elements';
import { useStateValue } from './store/StateProvider';
import { ActionType } from './store/actions';
import { generateUsername } from '../../lib/supabase/store';
import PressableText from '../../components/PressableText';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Username'>;
  route: RouteProp<StackParamList, 'Username'>;
}

function UsernameScreen({ navigation }: Props) {
  const {
    state: { firstName, lastName, username: usernameState },
    dispatch,
  } = useStateValue();
  const [username, setUsername] = useState(usernameState ?? '');

  useEffect(() => {
    async function generate() {
      if (firstName && lastName) {
        const uniqueUsername = await generateUsername(firstName, lastName);
        setUsername(uniqueUsername);
      }
    }
    generate();
  }, []);
  const next = () => {
    dispatch({
      type: ActionType.SET_USER,
      payload: {
        username,
      },
    });
    navigation.navigate('Password');
  };

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <View style={{ marginBottom: 50 }}>
          <Text style={styles.prompt}>Your Username</Text>
          <Text style={styles.prompt}>{username}</Text>
          <PressableText
            onPress={() => navigation.navigate('ChangeUsername', { username })}
          >
            Change my username
          </PressableText>
          {/* <Input label='Username' onChangeText={setUsername} /> */}
        </View>
      </View>
      <View style={styles.bottom}>
        <Button type='info' onPress={next}>
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

export default UsernameScreen;
