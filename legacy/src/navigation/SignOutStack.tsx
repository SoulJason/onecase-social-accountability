/**
 * Stack navigator for when user is not signed in
 */
import React, { useRef, useEffect } from 'react';
import {
  DefaultTheme,
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import InitialScreen from '../screens/RootScreen';
import CreateAccountStack from './CreateAccountStack';

import { Button } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import ResetPasswordEnterPhoneScreen from '../screens/reset-password/ResetPasswordEnterPhoneScreen';
import ResetPasswordVerifyPhoneScreen from '../screens/reset-password/ResetPasswordVerifyPhoneScreen';
import ResetPasswordEnterEmailScreen from '../screens/reset-password/ResetPasswordEnterEmailScreen';
import { useMixpanel } from '../providers/MixpanelContext';
import { AppState, AppStateStatus } from 'react-native';
//  import UnavailablePage from '../screens/Unavailable';

export type SignOutStackParamList = {
  Initial: undefined;
  CreateAccount: undefined;
  SignUp: undefined;
  Login: undefined;
  Name: undefined;
  Username: undefined;
  Password: undefined;
  VerifyPhone: {
    phoneNumber: string;
  };
  ProfilePhoto: undefined;
  ResetPasswordEnterEmail: undefined;
  ResetPasswordEnterPhone: undefined;
  ResetPasswordVerifyPhone: {
    phone: string;
  };
  ResetPassword: undefined;
};

const Stack = createStackNavigator();

function SignOutStack() {
  const navigationRef = useRef<NavigationContainerRef>(null);
  const routeNameRef = useRef<string>();
  const mixpanel = useMixpanel();

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState.match(/inactive|background/)) {
      mixpanel?.track('Left screen', { 'Screen Name': routeNameRef.current });
    }
  };

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange);
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: '#FFFCF7',
        },
      }}
      onReady={() => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      onStateChange={async () => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

        // TODO: Check if current route is one of user generated ones
        if (previousRouteName !== currentRouteName) {
          mixpanel?.track('Screen viewed', { 'Screen Name': currentRouteName });
        }
        routeNameRef.current = currentRouteName;
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            elevation: 0,
            backgroundColor: '#FFFCF7',
            shadowOpacity: 0,
          },
          cardStyle: { backgroundColor: '#FFFCF7' },
          cardShadowEnabled: false,
          gestureEnabled: false,
        }}
      >
        <Stack.Screen
          name='Initial'
          component={InitialScreen}
          options={() => ({
            headerShown: false,
          })}
        />
        <Stack.Screen
          name='CreateAccount'
          component={CreateAccountStack}
          options={() => ({
            headerShown: false,
          })}
        />
        {/* <Stack.Screen name='Auth' component={AuthScreen} /> */}
        <Stack.Screen
          name='Login'
          component={LoginScreen}
          options={({ navigation }) => ({
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
            title: '',
          })}
        />
        <Stack.Screen
          name='ResetPasswordEnterEmail'
          component={ResetPasswordEnterEmailScreen}
          options={({ navigation }) => ({
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
            title: '',
          })}
        />
        <Stack.Screen
          name='ResetPasswordEnterPhone'
          component={ResetPasswordEnterPhoneScreen}
          options={({ navigation }) => ({
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
            title: '',
          })}
        />
        <Stack.Screen
          name='ResetPasswordVerifyPhone'
          component={ResetPasswordVerifyPhoneScreen}
          options={({ navigation }) => ({
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
            title: '',
          })}
        />

        {/* <Stack.Screen name="Unavailable" component={UnavailablePage} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default SignOutStack;
