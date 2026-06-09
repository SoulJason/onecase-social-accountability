import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Button from '../../components/Button';
import EStyleSheet from 'react-native-extended-stylesheet';
import ShadowStyle from '../../constants/ShadowStyle';
import CreateProfileTemplate from '../../components/CreateProfileTemplate';
import supabase from '../../lib/supabase';
import TextInput from '../../components/TextInput';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParamList } from '../../navigation/SignInStack';
import { useUser } from '../../providers/UserContext';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'ResetPassword'>;
}

function ResetPasswordScreen({ navigation }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const resetPassword = async () => {
    setLoading(true);
    if (password && password.length >= 6) {
      try {
        await supabase
          .from('users')
          .update({
            reset_password: false,
          })
          .eq('id', user?.id);
        await supabase.auth.update({
          password,
        });
        navigation.navigate('HomeTab');
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    } else {
      setLoading(false);
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
        <View>
          <Text style={styles.prompt}>Enter New Password</Text>
        </View>
        <TextInput
          placeholder='Password'
          secureTextEntry
          textContentType='password'
          autoCompleteType='password'
          onChangeText={handlePasswordChange}
        />
        {error !== '' ? <Text style={styles.error}>{error}</Text> : null}
      </View>
      <View style={styles.bottom}>
        <Button type='primary' disabled={loading} onPress={resetPassword}>
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
  error: {
    color: '#FF6363',
  },
});

export default ResetPasswordScreen;
