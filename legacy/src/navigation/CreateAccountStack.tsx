import React from 'react';
import { Button } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import { StateProvider } from '../screens/create-account/store/StateProvider';
import { initialState, reducer } from '../screens/create-account/store/reducer';

//Screens
import NameScreen from '../screens/create-account/NameScreen';
import UsernameScreen from '../screens/create-account/UsernameScreen';
import SignUpScreen from '../screens/create-account/SignUpScreen';
import VerifyPhoneScreen from '../screens/create-account/VerifyPhoneScreen';
import ChangeUsernameScreen from '../screens/create-account/ChangeUsernameScreen';
import PasswordScreen from '../screens/create-account/PasswordScreen';

export type StackParamList = {
  Name: undefined;
  Username: undefined;
  ChangeUsername: {
    username: string;
  };
  Password: undefined;
  SignUp: undefined;
  VerifyPhone: {
    phone: string;
  };
};

const Stack = createStackNavigator<StackParamList>();

function CreateAccountStack() {
  return (
    <StateProvider initialState={initialState} reducer={reducer}>
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          headerStyle: {
            elevation: 0,
            backgroundColor: '#FFFCF7',
            shadowOpacity: 0,
          },
          cardStyle: { backgroundColor: '#FFFCF7' },
          cardShadowEnabled: false,
          gestureEnabled: false,
          title: '',
          headerLeft: () => (
            <Button
              icon={<Ionicons name='chevron-back' size={24} color='black' />}
              type='clear'
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                }
              }}
            />
          ),
        })}
        initialRouteName='Name'
      >
        <Stack.Screen name='Name' component={NameScreen} />
        <Stack.Screen name='Username' component={UsernameScreen} />
        <Stack.Screen name='ChangeUsername' component={ChangeUsernameScreen} />
        <Stack.Screen name='Password' component={PasswordScreen} />
        <Stack.Screen name='SignUp' component={SignUpScreen} />
        <Stack.Screen name='VerifyPhone' component={VerifyPhoneScreen} />
      </Stack.Navigator>
    </StateProvider>
  );
}

export default CreateAccountStack;
