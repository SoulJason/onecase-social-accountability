import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView } from 'react-native';
import Button from '../../components/Button';
import EStyleSheet from 'react-native-extended-stylesheet';
import ShadowStyle from '../../constants/ShadowStyle';
import CreateProfileTemplate from '../../components/CreateProfileTemplate';
import { RouteProp, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import CodeField from '../../components/CodeField/CodeField';
import { StackNavigationProp } from '@react-navigation/stack';
import { SignOutStackParamList } from '../../navigation/SignOutStack';
import supabase from '../../lib/supabase';
import apiCaller from '../../utils/apiCaller';

interface Props {
  navigation: StackNavigationProp<
    SignOutStackParamList,
    'ResetPasswordVerifyPhone'
  >;
  route: RouteProp<SignOutStackParamList, 'ResetPasswordVerifyPhone'>;
}

function ResetPasswordVerifyPhoneScreen({ navigation, route }: Props) {
  const { phone } = route.params;
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const verifyNumber = async () => {
    try {
      setLoading(true);
      const response = await apiCaller.post('/verify', {
        phone,
        token,
      });
      if (response.status === 200) {
        await supabase
          .from('users')
          .update({
            reset_password: true,
          })
          .eq('id', response.data.userId);
        await supabase.auth.signIn({
          refreshToken: response.data.refreshToken,
        });
      } else {
        setLoading(false);
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Invalid Token',
          topOffset: 50,
        });
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <View style={styles.main}>
        <View>
          <Text style={styles.prompt}>Enter the verification code</Text>
          <CodeField onChange={setToken} />
        </View>
      </View>
      <View style={styles.bottom}>
        <Button type='primary' disabled={loading} onPress={verifyNumber}>
          Continue
        </Button>
      </View>
    </KeyboardAvoidingView>
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
    marginBottom: '8%',
    fontSize: 24,
    fontFamily: '$semiboldFont',
    textAlign: 'center',
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

export default ResetPasswordVerifyPhoneScreen;
