import React from 'react';
import { Button } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';

import { createStackNavigator } from '@react-navigation/stack';

//Screens
import NameScreen from '../screens/create-account/NameScreen';
import { StateProvider } from '../screens/create-account/store/StateProvider';
import { initialState, reducer } from '../screens/create-account/store/reducer';
import ContactsScreen from '../screens/onboard/ContactsScreen';
import ProfilePictureScreen from '../screens/onboard/ProfilePictureScreen';
import WelcomeScreen from '../screens/onboard/WelcomeScreen';
import ConfirmProfilePictureScreen from '../screens/onboard/ConfirmProfilePictureScreen';

export type StackParamList = {
  Contacts: undefined;
  ProfilePicture: undefined;
  ConfirmProfilePicture: {
    image: {
      avatarUrl: string;
      base64Image: string;
    };
  };
  Welcome: undefined;
  HomeTab: undefined;
};

const Stack = createStackNavigator<StackParamList>();

function OnboardStack() {
  return (
    <StateProvider initialState={initialState} reducer={reducer}>
      <Stack.Navigator
        screenOptions={({ navigation, route }) => ({
          headerShown: false,
        })}
        initialRouteName='Contacts'
      >
        <Stack.Screen name='Contacts' component={ContactsScreen} />
        <Stack.Screen name='ProfilePicture' component={ProfilePictureScreen} />
        <Stack.Screen
          name='ConfirmProfilePicture'
          component={ConfirmProfilePictureScreen}
        />
        <Stack.Screen name='Welcome' component={WelcomeScreen} />
      </Stack.Navigator>
    </StateProvider>
  );
}

export default OnboardStack;
