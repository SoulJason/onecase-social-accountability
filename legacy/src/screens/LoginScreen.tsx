// Login.js
import React, { useState, useRef } from 'react';
import { View, Text } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import Button from '../components/Button';
import EStyleSheet from 'react-native-extended-stylesheet';
import supabase from '../lib/supabase';
import TextInput from '../components/TextInput';
import PressableText from '../components/PressableText';
import ShadowStyle from '../constants/ShadowStyle';
import CreateProfileTemplate from '../components/CreateProfileTemplate';
import Modal from '../components/Modal';
import { useNavigation } from '@react-navigation/native';
import { useMixpanel } from '../providers/MixpanelContext';
import apiCaller from '../utils/apiCaller';

/**
 * Login page as well as verify number page for phone number login/authentication
 */
function Login() {
  const navigation = useNavigation();
  const [showPhone, setShowPhone] = useState(false);
  const [authInput, setAuthInput] = useState('');
  const [password, setPassword] = useState('');
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const mixpanel = useMixpanel();

  const phoneInput = useRef<PhoneInput>(null);
  // const textInput = useRef<TextInput>(null);

  const handleLogin = async () => {
    setLoading(true);
    console.log('bruh');
    if (showPhone && authInput !== '' && password !== '') {
      try {
        await supabase.auth.signIn({
          phone: authInput,
          password,
        });
        mixpanel?.track('Logged in');
      } catch (error) {
        setLoading(false);
      }
    } else {
      try {
        // const { error } = await supabase.auth.signIn({
        //   email: authInput,
        //   password,
        // });
        const response = await apiCaller.post('/login', {
          username: authInput,
          password,
        });
        const { refreshToken } = response.data;
        await supabase.auth.signIn({
          refreshToken,
        });
        mixpanel?.track('Logged in');
      } catch (error) {
        console.log('error', error);
        setLoading(false);
      }
    }
  };

  return (
    <CreateProfileTemplate>
      <View style={styles.main}>
        <View>
          <Text style={styles.prompt}>Log In</Text>
        </View>
        {showPhone ? (
          <>
            <PhoneInput
              ref={phoneInput}
              containerStyle={styles.inputContainer}
              textContainerStyle={styles.input}
              flagButtonStyle={styles.flagButton}
              defaultCode='US'
              // defaultValue={phoneNumber}
              onChangeFormattedText={setAuthInput}
              withDarkTheme
              withShadow
              autoFocus={false}
            />
            <View
              style={{
                width: '100%',
                marginTop: 5,
              }}
            >
              <PressableText
                onPress={() => setShowPhone(!showPhone)}
                textStyle={styles.text}
              >
                Use email or username instead
              </PressableText>
            </View>
          </>
        ) : (
          <>
            <TextInput
              placeholder='Username or Email'
              autoCapitalize='none'
              onChangeText={setAuthInput}
            />
            <View style={{ width: '100%', marginTop: 5 }}>
              <PressableText
                onPress={() => setShowPhone(!showPhone)}
                textStyle={styles.text}
              >
                Use phone number instead
              </PressableText>
            </View>
          </>
        )}
        <TextInput
          placeholder='Password'
          secureTextEntry
          textContentType='password'
          autoCompleteType='password'
          onChangeText={setPassword}
          style={{ marginTop: 15 }}
        />
        <PressableText
          style={styles.forgotPassword}
          onPress={() => setAuthModalVisible(true)}
          textStyle={styles.text}
        >
          Forgot your password?
        </PressableText>
      </View>
      <View style={styles.bottom}>
        <Button type='primary' disabled={loading} onPress={handleLogin}>
          Log In
        </Button>
      </View>
      <Modal
        title='Please choose how you want to reset your password'
        visible={authModalVisible}
        showButtons={false}
        animationIn='slideInUp'
        animationOut='slideOutDown'
        onBackdropPress={() => setAuthModalVisible(false)}
      >
        <View
          style={{
            alignItems: 'center',
          }}
        >
          <Button
            type='info'
            onPress={() => {
              setAuthModalVisible(false);
              navigation.navigate('ResetPasswordEnterEmail');
            }}
          >
            via Email
          </Button>
          <Button
            type='info'
            style={{ marginTop: 10 }}
            onPress={() => {
              setAuthModalVisible(false);
              navigation.navigate('ResetPasswordEnterPhone');
            }}
          >
            via Phone
          </Button>
          <PressableText
            style={{ color: 'black', marginTop: 10 }}
            onPress={() => setAuthModalVisible(false)}
          >
            Cancel
          </PressableText>
        </View>
      </Modal>
    </CreateProfileTemplate>
  );
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  forgotPassword: {
    marginTop: 20,
  },
  title: {
    fontFamily: '$titleFont',
    color: '$blueberry',
    fontSize: 40,
  },
  prompt: {
    marginBottom: '8%',
    // marginTop: '15%',
    fontSize: 24,
    fontFamily: '$semiboldFont',
    // fontSize: RFPercentage(2.5),
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
  text: {
    fontFamily: '$normalFont',
    fontSize: 15,
    color: '#43A4EB',
  },
  button: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '$grannySmithApple',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 24,
    marginRight: 5,
    fontWeight: '700',
  },
  bottomQuote: {
    color: 'white',
    position: 'absolute',
    bottom: '5%',
    // fontSize: RFPercentage(2.5),
    marginHorizontal: '8%',
    textAlign: 'center',
  },
  codeFieldRoot: {
    marginTop: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  cellRoot: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  cellText: {
    color: '#000',
    fontSize: 36,
    textAlign: 'center',
  },
  focusCell: {
    borderBottomColor: '#007AFF',
    borderBottomWidth: 2,
  },
});

export default Login;
