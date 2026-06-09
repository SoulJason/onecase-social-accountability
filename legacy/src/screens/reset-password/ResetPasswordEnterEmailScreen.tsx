import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Button from '../../components/Button';
import EStyleSheet from 'react-native-extended-stylesheet';
import ShadowStyle from '../../constants/ShadowStyle';
import CreateProfileTemplate from '../../components/CreateProfileTemplate';
import { StackNavigationProp } from '@react-navigation/stack';
import { SignOutStackParamList } from '../../navigation/SignOutStack';
import TextInput from '../../components/TextInput';
import supabase from '../../lib/supabase';
import Toast from 'react-native-toast-message';

interface Props {
  navigation: StackNavigationProp<
    SignOutStackParamList,
    'ResetPasswordEnterEmail'
  >;
}

function ResetPasswordEnterEmailScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const enterEmail = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.api.resetPasswordForEmail(email);
      if (!error) {
        navigation.navigate('Login');
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Password reset mail sent!',
          text2:
            'Check your email for instructions on how to reset your password',
          topOffset: 50,
        });
      } else {
        console.log('error', error);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <CreateProfileTemplate>
      <View style={styles.main}>
        <View>
          <Text style={styles.prompt}>Enter Email Address</Text>
        </View>
        <TextInput
          placeholder='Email'
          autoCapitalize='none'
          textContentType='emailAddress'
          autoCompleteType='email'
          onChangeText={setEmail}
        />
      </View>
      <View style={styles.bottom}>
        <Button type='primary' disabled={loading} onPress={enterEmail}>
          Continue
        </Button>
      </View>
    </CreateProfileTemplate>
  );
}

const styles = EStyleSheet.create({
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
    marginBottom: '8%',
    fontSize: 24,
    fontFamily: '$semiboldFont',
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
});

export default ResetPasswordEnterEmailScreen;
