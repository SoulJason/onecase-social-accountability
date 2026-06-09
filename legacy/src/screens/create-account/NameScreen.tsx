import React, { useState } from 'react';
import { View, Text, Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Button from '../../components/Button';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { Input } from 'react-native-elements';
import { useStateValue } from './store/StateProvider';
import { ActionType } from './store/actions';
import { StackParamList } from '../../navigation/CreateAccountStack';
import { ScrollView } from 'react-native-gesture-handler';
import CreateProfileTemplate from '../../components/CreateProfileTemplate';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Name'>;
  route: RouteProp<StackParamList, 'Name'>;
}

function NameScreen({ navigation }: Props) {
  const {
    state: { firstName: firstNameState, lastName: lastNameState },
    dispatch,
  } = useStateValue();
  const [firstName, setFirstName] = useState(firstNameState);
  const [lastName, setLastName] = useState(lastNameState);

  const next = () => {
    dispatch({
      type: ActionType.SET_USER,
      payload: {
        firstName,
        lastName,
      },
    });
    if (firstName === '' || lastName === '') {
      navigation.navigate('ChangeUsername', { username: '' });
    } else {
      navigation.navigate('Username');
    }
  };

  return (
    <CreateProfileTemplate>
      {/* <ScrollView style={{ flex: 1 }}> */}
      <View style={styles.main}>
        <View>
          <Text style={styles.prompt}>What's your name?</Text>
        </View>
        <View>
          <Input label='First Name' onChangeText={setFirstName} />
          <Input label='Last Name' onChangeText={setLastName} />
        </View>
      </View>
      {/* </ScrollView> */}
      <View style={styles.bottom}>
        <Button
          type='info'
          disabled={firstName === '' && lastName === ''}
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

export default NameScreen;
