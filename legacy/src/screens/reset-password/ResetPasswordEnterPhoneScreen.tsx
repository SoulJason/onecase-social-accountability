import React, { useState, useRef } from 'react';
import { View, Text } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import Button from '../../components/Button';
import EStyleSheet from 'react-native-extended-stylesheet';
import ShadowStyle from '../../constants/ShadowStyle';
import CreateProfileTemplate from '../../components/CreateProfileTemplate';
import { StackNavigationProp } from '@react-navigation/stack';
import { SignOutStackParamList } from '../../navigation/SignOutStack';
import apiCaller from '../../utils/apiCaller';

interface Props {
  navigation: StackNavigationProp<
    SignOutStackParamList,
    'ResetPasswordEnterPhone'
  >;
}

function ResetPasswordEnterPhoneScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const phoneInput = useRef<PhoneInput>(null);
  // const textInput = useRef<TextInput>(null);

  const enterPhone = async () => {
    setLoading(true);
    try {
      const response = await apiCaller.post('/reset-password', {
        phone,
      });
      navigation.replace('ResetPasswordVerifyPhone', { phone });
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <CreateProfileTemplate>
      <View style={styles.main}>
        <View>
          <Text style={styles.prompt}>Enter Phone Number</Text>
        </View>
        <PhoneInput
          ref={phoneInput}
          containerStyle={styles.inputContainer}
          textContainerStyle={styles.input}
          flagButtonStyle={styles.flagButton}
          defaultCode='US'
          onChangeFormattedText={setPhone}
          withDarkTheme
          withShadow
          autoFocus={false}
        />
      </View>
      <View style={styles.bottom}>
        <Button type='primary' disabled={loading} onPress={enterPhone}>
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

export default ResetPasswordEnterPhoneScreen;
