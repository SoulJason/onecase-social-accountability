import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/home/HomeScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FriendsScreen from '../screens/home/FriendsScreen';
import ProfileScreen from '../screens/home/ProfileScreen';

export type BottomTabParamList = {
  Home: undefined;
  Settings: undefined;
  Friends: undefined;
  Profile: undefined;
  UserProfile: {
    userId: string;
  };
  AddFriends: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

function HomeTabScreen() {
  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused
                ? ('ios-home-sharp' as const)
                : ('ios-home-outline' as const);
            } else if (route.name === 'Settings') {
              iconName = focused
                ? ('settings-sharp' as const)
                : ('settings-outline' as const);
            } else if (route.name === 'Friends') {
              iconName = focused
                ? ('people-sharp' as const)
                : ('people-outline' as const);
            } else if (route.name === 'Profile') {
              iconName = focused
                ? ('person-circle-sharp' as const)
                : ('person-circle-outline' as const);
            }
            // You can return any component that you like here!
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          // tabBarVisible: route.name !== 'CreateTask',
        })}
        tabBarOptions={{
          activeTintColor: 'black',
          inactiveTintColor: 'gray',
          showLabel: false,
        }}
      >
        <Tab.Screen name='Home' component={HomeScreen} />
        {/* <Tab.Screen name='Settings' component={SettingsScreen} /> */}
        <Tab.Screen name='Friends' component={FriendsScreen} />
        <Tab.Screen name='Profile' component={ProfileScreen} />
      </Tab.Navigator>
    </>
  );
}

export default HomeTabScreen;
