import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Button from '../../components/Button';
import Constants from 'expo-constants';

import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp, useHeaderHeight } from '@react-navigation/stack';
import { StackParamList } from '../../navigation/CreateAccountStack';
import { Input } from 'react-native-elements';
import { useStateValue } from './store/StateProvider';
import { ActionType } from './store/actions';
import { checkUsername, generateUsername } from '../../lib/supabase/store';
import useDebounce from '../../hooks/useDebounce';
import { sanitizeUsername } from '../../helpers/sanitizeUsername';
import CreateProfileTemplate from '../../components/CreateProfileTemplate';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'ChangeUsername'>;
  route: RouteProp<StackParamList, 'ChangeUsername'>;
}

function ChangeUsernameScreen({ navigation, route }: Props) {
  const { username: generatedUsername } = route.params;
  const {
    state: { firstName, lastName },
    dispatch,
  } = useStateValue();
  const [usernameInput, setUsernameInput] = useState(generatedUsername);
  const {
    state: [username, setUsername],
    debouncing,
  } = useDebounce(generatedUsername, 1000);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [sanitizedUsername, setSanitizedUsername] = useState(
    sanitizeUsername(username)
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const headerHeight = useHeaderHeight();

  useEffect(() => {
    async function generate() {
      if (firstName && lastName) {
        const uniqueUsername = await generateUsername(firstName, lastName);
        setUsername(uniqueUsername);
      }
    }
    generate();
  }, []);

  useEffect(() => {
    async function check() {
      const onlyAlphabeticalRegexp = /[a-zA-Z0-9._-]+/;
      const onlyAlphabeticalStartRegexp = /^(?=[a-zA-Z]).+/;
      const onlyAlphanumricalEndRegexp = /^(?=.*[a-zA-Z0-9]$).+/;

      if (validateUsername(username)) {
        setError('');
        setLoading(true);
        const isAvailable = await checkUsername(username);
        setUsernameAvailable(isAvailable);
        setSanitizedUsername(sanitizeUsername(username));
      } else {
        if (username.length < 3) {
          setError('Usernames must be at least 3 characters long');
        } else if (!onlyAlphabeticalRegexp.test(username)) {
          setError(
            'Usernames must only include alphabetical letters, numbers, and one of -, _, or .'
          );
        } else if (!onlyAlphabeticalStartRegexp.test(username)) {
          setError('Usernames must start with a letter');
        } else if (!onlyAlphanumricalEndRegexp.test(username)) {
          setError('Usernames must end in a letter or number');
        } else {
          setError(
            'Usernames must only include alphabetical letters, numbers, and one of -, _, or .'
          );
        }
      }
      setLoading(false);
    }
    check();
  }, [username]);

  const validateUsername = (username: string) => {
    const regexp = /^(?=[a-zA-Z0-9._-]{3,15}$)(?!.*[_.-]{2})[^_.-].*[^_.-]$/;
    // /(?=.{3,15}$)(?![_.-])(?!.*[_.-]{2})[a-zA-Z0-9._-]+(?<![_.-])/; // lookbehind
    return regexp.test(username);
  };

  const next = () => {
    dispatch({
      type: ActionType.SET_USER,
      payload: {
        username,
      },
    });
    navigation.navigate('Password');
  };

  const handleUsernameChange = (username: string) => {
    setUsernameInput(username);
    setUsername(username);
  };

  const subtext = () => {
    if (usernameInput !== '') {
      if (debouncing || loading) {
        return (
          <>
            <ActivityIndicator color='black' />
            <Text style={{ color: 'black', marginLeft: 5 }}>Checking...</Text>
          </>
        );
      } else {
        if (error !== '') {
          return <Text style={{ color: '#FF6363' }}>{error}</Text>;
        } else if (usernameAvailable) {
          return <Text style={{ color: '#96DE90' }}>Username available</Text>;
        } else {
          return (
            <Text style={{ color: '#FF6363' }}>
              {sanitizedUsername} already taken!
            </Text>
          );
        }
      }
    }
  };

  return (
    <CreateProfileTemplate>
      <View style={styles.main}>
        <View style={{ marginBottom: 40 }}>
          <Text style={styles.prompt}>Type a username</Text>
          <Text style={styles.description}>
            Your username is how friends will find you on OneCase
          </Text>
          <Input
            label='Username'
            defaultValue={generatedUsername}
            autoCapitalize='none'
            containerStyle={{
              marginTop: 40,
            }}
            onChangeText={handleUsernameChange}
          />
          <View
            style={{
              flexDirection: 'row',
              minHeight: 20,
              alignItems: 'center',
            }}
          >
            {subtext()}
          </View>
        </View>
      </View>
      <View style={styles.bottom}>
        <Button
          type='info'
          disabled={debouncing || loading || !usernameAvailable}
          onPress={next}
        >
          Continue
        </Button>
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
  },
  bottom: {
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 10 : 40,
    alignItems: 'center',
    marginHorizontal: 30,
  },
  prompt: {
    fontSize: 25,
    fontFamily: '$normalFont',
    marginBottom: 20,
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
});

export default ChangeUsernameScreen;
