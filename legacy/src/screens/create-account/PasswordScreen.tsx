import React, { useState } from 'react';
import { View, Text } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Button from '../../components/Button';

import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { Input } from 'react-native-elements';
import { useStateValue } from './store/StateProvider';
import { ActionType } from './store/actions';
import { StackParamList } from '../../navigation/CreateAccountStack';
import CreateProfileTemplate from '../../components/CreateProfileTemplate';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Password'>;
  route: RouteProp<StackParamList, 'Password'>;
}

function PasswordScreen({ navigation }: Props) {
  const {
    state: { password: passwordState },
    dispatch,
  } = useStateValue();
  const [password, setPassword] = useState(passwordState);
  const [error, setError] = useState('');

  const next = () => {
    if (password && password.length >= 6) {
      setError('');
      dispatch({
        type: ActionType.SET_USER,
        payload: {
          password,
        },
      });
      navigation.navigate('SignUp');
    } else {
      setError('Your password must be at least 6 characters.');
    }
  };

  const handlePasswordChange = (password: string) => {
    setError('');
    setPassword(password);
  };

  return (
    <CreateProfileTemplate>
      <View style={styles.main}>
        <View style={{ marginBottom: 40 }}>
          <Text style={styles.prompt}>Enter a password</Text>
          <Text style={styles.description}>
            Your password should be at least 6 characters
          </Text>
        </View>
        <View>
          <Input
            label='Password'
            secureTextEntry
            textContentType='password'
            autoCompleteType='password'
            onChangeText={handlePasswordChange}
          />
          {error !== '' ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </View>
      <View style={styles.bottom}>
        <Button type='info' disabled={error !== ''} onPress={next}>
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
    marginBottom: 40,
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
  error: {
    color: '#FF6363',
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

export default PasswordScreen;
