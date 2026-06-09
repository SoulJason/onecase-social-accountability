import React, { useState, useRef } from 'react';
import { View, Text, Platform, KeyboardAvoidingView } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Button from '../../components/Button';
import PhoneInput from 'react-native-phone-number-input';

import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import supabase from '../../lib/supabase';
import { StackParamList } from '../../navigation/CreateAccountStack';
import { useStateValue } from './store/StateProvider';
import { ActionType } from './store/actions';
import CreateProfileTemplate from '../../components/CreateProfileTemplate';
import ShadowStyle from '../../constants/ShadowStyle';
import Toast from 'react-native-toast-message';
import DismissKeyboardView from '../../components/DismissKeyboardView';
import PressableText from '../../components/PressableText';
import TextInput from '../../components/TextInput';
import { createUser } from '../../lib/supabase/store';
import useAddUser from '../../mutations/useAddUser';
import { useMixpanel } from '../../providers/MixpanelContext';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'SignUp'>;
  route: RouteProp<StackParamList, 'SignUp'>;
}

function SignUpScreen({ navigation }: Props) {
  const {
    state: { password },
    dispatch,
  } = useStateValue();
  const { state } = useStateValue();
  const [showPhone, setShowPhone] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const phoneInput = useRef<PhoneInput>(null);
  const mixpanel = useMixpanel();

  const verifyAuth = async () => {
    setLoading(true);
    if (!showPhone && email !== '') {
      const { session, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (!error && session) {
        mixpanel?.identify(session.user?.id);
        mixpanel?.track('Created account');
        mixpanel?.people_set({
          $email: email,
          $phone: phone,
          $first_name: state.firstName,
          $last_name: state.lastName,
          $username: state.username,
          $created: new Date(),
        });
        await createUser(session.user?.id ?? '', state);
        // await addUserMutation.mutate();
        // navigation.navigate('VerifyPhone', { phone }); TODO: VerifyEmail
      } else {
        if (
          error?.message.includes('error saving new user') ||
          error?.message.includes('already registered')
        ) {
          Toast.show({
            type: 'error',
            position: 'top',
            text1: 'Email Address Already Used',
            text2: 'This email address is already used!',
            topOffset: 50,
          });
          setLoading(false);
        }
      }
    } else if (showPhone && phone !== '') {
      const { session, error } = await supabase.auth.signUp({
        phone,
        password,
      });
      if (!error && session) {
        dispatch({
          type: ActionType.SET_USER,
          payload: {
            phone,
          },
        });
        mixpanel?.identify(session.user?.id);
        mixpanel?.track('Created account');
        mixpanel?.people_set({
          $email: email,
          $phone: phone,
          $first_name: state.firstName,
          $last_name: state.lastName,
          $username: state.username,
          $created: new Date(),
        });
        navigation.navigate('VerifyPhone', { phone });
      } else if (error) {
        if (error.message.includes('already registered')) {
          Toast.show({
            type: 'error',
            position: 'top',
            text1: 'Phone Number Already Used',
            text2: 'This phone number is already used!',
            topOffset: 50,
          });
        } else if (
          error.message.includes('must be either email or phone') ||
          error.message.includes('not a valid phone') ||
          error.message.includes('Invalid phone')
        ) {
          Toast.show({
            type: 'error',
            position: 'top',
            text1: 'Invalid Phone Number',
            text2: 'Please enter a valid phone number!',
            topOffset: 50,
          });
          // setError('Please enter a valid phone number');
        }
        setLoading(false);
      }
    }
  };

  const handleEmailChange = (email: string) => {
    dispatch({
      type: ActionType.SET_USER,
      payload: {
        email,
      },
    });
    setEmail(email);
  };

  const handlePhoneChange = (phone: string) => {
    setError('');
    setPhone(phone);
  };

  if (Platform.OS === 'android') {
    return (
      <KeyboardAvoidingView style={styles.container}>
        <View style={styles.main}>
          {showPhone ? (
            <>
              <View>
                <Text style={styles.prompt}>What's your phone number?</Text>
                <PressableText
                  style={styles.pressableText}
                  onPress={() => setShowPhone(!showPhone)}
                >
                  Sign up with email instead
                </PressableText>
              </View>
              <PhoneInput
                ref={phoneInput}
                containerStyle={styles.inputContainer}
                textContainerStyle={styles.input}
                flagButtonStyle={styles.flagButton}
                defaultCode='US'
                // defaultValue={phoneNumber}
                onChangeFormattedText={handlePhoneChange}
                withDarkTheme
                withShadow
                autoFocus={false}
              />
              <View>
                <Text style={styles.subtext}>
                  You may receive SMS updates from OneCase and can opt out at
                  any time
                </Text>
              </View>
            </>
          ) : (
            <>
              <View>
                <Text style={styles.prompt}>What's your email address?</Text>
                <PressableText
                  style={styles.pressableText}
                  onPress={() => setShowPhone(!showPhone)}
                >
                  Sign up with phone number instead
                </PressableText>
              </View>
              <TextInput
                placeholder='Email'
                autoCapitalize='none'
                textContentType='emailAddress'
                autoCompleteType='email'
                onChangeText={handleEmailChange}
              />
              <View>
                <Text style={styles.subtext}>
                  You may receive emails from OneCase and can opt out at any
                  time
                </Text>
              </View>
            </>
          )}
          {error !== '' ? <Text style={styles.error}>{error}</Text> : null}
        </View>
        <View style={styles.bottom}>
          <Button type='info' disabled={loading} onPress={verifyAuth}>
            Continue
          </Button>
        </View>
      </KeyboardAvoidingView>
    );
  }
  return (
    <CreateProfileTemplate>
      <View style={styles.main}>
        {showPhone ? (
          <>
            <View>
              <Text style={styles.prompt}>What's your phone number?</Text>
              <PressableText
                style={styles.pressableText}
                onPress={() => setShowPhone(!showPhone)}
              >
                Sign up with email instead
              </PressableText>
            </View>
            <PhoneInput
              ref={phoneInput}
              containerStyle={styles.inputContainer}
              textContainerStyle={styles.input}
              flagButtonStyle={styles.flagButton}
              defaultCode='US'
              onChangeFormattedText={handlePhoneChange}
              withDarkTheme
              withShadow
              autoFocus={false}
            />
            <View>
              <Text style={styles.subtext}>
                You may receive SMS updates from OneCase and can opt out at any
                time
              </Text>
            </View>
          </>
        ) : (
          <>
            <View>
              <Text style={styles.prompt}>What's your email address?</Text>
              <PressableText
                style={styles.pressableText}
                onPress={() => setShowPhone(!showPhone)}
              >
                Sign up with phone number instead
              </PressableText>
            </View>
            <TextInput
              placeholder='Email'
              autoCapitalize='none'
              textContentType='emailAddress'
              autoCompleteType='email'
              onChangeText={setEmail}
            />
            <View>
              <Text style={styles.subtext}>
                You may receive emails from OneCase and can opt out at any time
              </Text>
            </View>
          </>
        )}
        {error !== '' ? <Text style={styles.error}>{error}</Text> : null}
      </View>
      <View style={styles.bottom}>
        <Button type='info' disabled={loading} onPress={verifyAuth}>
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
    alignItems: 'center',
  },
  bottom: {
    justifyContent: 'center',
    marginBottom: 30,
    alignItems: 'center',
    marginHorizontal: 30,
  },
  pressableText: {
    textAlign: 'center',
    marginBottom: 40,
  },
  prompt: {
    fontSize: '$heading',
    fontFamily: '$semiboldFont',
    marginBottom: 20,
    textAlign: 'center',
  },
  error: {
    color: '#FF6363',
  },
  flagButton: {
    width: 52,
  },
  inputContainer: {
    borderRadius: 15,
    width: '100%',
    paddingHorizontal: 5,
    ...ShadowStyle,
  },
  input: {
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  subtext: {
    fontFamily: '$normalFont',
    color: '#686868',
    marginTop: 15,
    textAlign: 'center',
  },
});

export default SignUpScreen;
