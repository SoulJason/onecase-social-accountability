import React, { useRef, useMemo, useCallback, useEffect } from 'react';
import {
  AppState,
  AppStateStatus,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Button } from 'react-native-elements';
import { createStackNavigator } from '@react-navigation/stack';
import {
  NavigationContainer,
  DefaultTheme,
  getFocusedRouteNameFromRoute,
  NavigationContainerRef,
  useRoute,
} from '@react-navigation/native';
import { createDrawerNavigator, DrawerItem } from '@react-navigation/drawer';

import Colors from '../constants/Colors';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Case, Task, Update, User } from '../types';
// Components
import DrawerContent from '../components/DrawerContent';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Title, Caption } from 'react-native-paper';
// Screens
import HomeTabScreen, { BottomTabParamList } from './HomeTabScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen';
import AssignCouncilScreen from '../screens/AssignCouncilScreen';
import PreviewTaskScreen from '../screens/PreviewTaskScreen';
import TaskScreen from '../screens/TaskScreen';
import ClockInScreen from '../screens/ClockInScreen';
import CreateCaseScreen from '../screens/CreateCaseScreen';
import AssignTaskScreen from '../screens/AssignTaskScreen';
import AddFriendsScreen from '../screens/AddFriendsScreen';
import TaskUpdatesScreen from '../screens/TaskUpdatesScreen';
import TaskProgressScreen from '../screens/TaskProgressScreen';
import SelectCaseScreen from '../screens/SelectCaseScreen';
import OnboardStack from './OnboardStack';
import EditProfileScreen from '../screens/EditProfileScreen';
import useCurrentUser from '../queries/useCurrentUser';
import UserProfileScreen from '../screens/UserProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import RequestsScreen from '../screens/RequestsScreen';
import AssignTaskSelectCaseScreen from '../screens/AssignTaskSelectCaseScreen';
import CommentsScreen from '../screens/CommentsScreen';
import UpdateCaseScreen from '../screens/UpdateCaseScreen';
import useNotificationCount from '../queries/useNotificationCount';
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import IconButton from '../components/IconButton';
import { signOut } from '../lib/supabase/store';
import EditTaskScreen from '../screens/EditTaskScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ResetPasswordScreen from '../screens/reset-password/ResetPasswordScreen';
import { useMixpanel } from '../providers/MixpanelContext';
import DeleteAccountScreen from '../screens/DeleteAccountScreen';
import { useUser } from '../providers/UserContext';

const defaultStackNavOptions = {
  headerStyle: {
    backgroundColor: Platform.OS === 'android' ? Colors.primaryColor : '',
  },
  headerTitleStyle: {
    fontFamily: 'open-sans-bold',
  },
  headerBackTitleStyle: {
    fontFamily: 'open-sans',
  },
  headerTintColor: Platform.OS === 'android' ? 'white' : Colors.primaryColor,
  headerTitle: 'A Screen',
};

export type StackParamList = {
  Onboard: undefined;
  HomeTab: undefined;
  ResetPassword: undefined;
  Profile: undefined;
  Friends: undefined;
  EditProfile: undefined;
  CreateTask: {
    caseItem: Case;
  };
  EditTask: {
    task: Task;
    caseItem: Case;
  };
  SelectCase: undefined;
  CreateCase: {
    index: number;
  };
  UpdateCase: {
    caseItem: Case;
  };
  AssignTask: {
    assignee: User;
    caseItem: any;
    cases: Case[];
  };
  AssignTaskSelectCase: {
    assignee: User;
    cases: Case[];
  };
  PreviewTask: {
    title: string;
    description: string;
    image: string;
    imageDim: [number, number];
  };
  AssignCouncil: undefined;
  Task: {
    taskId: number;
  };
  Comments: {
    taskId: number;
  };
  TaskUpdates: {
    updates: Update[];
  };
  TaskProgress: {
    task: Task;
    totalTime: [number, number, number];
    secondsPassed: number;
    isFailure?: boolean;
  };
  ClockIn: {
    task: Task;
  };
  AddFriends: undefined;
  UserProfile: {
    userId: string;
  };
  Notifications: undefined;
  Requests: undefined;
  Settings: undefined;
  DeleteAccount: undefined;
};

const Stack = createStackNavigator<StackParamList>();
const Drawer = createDrawerNavigator();

function getRouteName(route: any) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Contacts';
  return routeName;
}

const Main = ({ navigation }: any) => {
  const { data: user, isLoading } = useCurrentUser();
  const { data: notificationCount } = useNotificationCount();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => [1, '60%'], []);
  // callbacks
  const showBottomSheet = useCallback(() => {
    if (bottomSheetModalRef.current) {
      bottomSheetModalRef.current.present();
    }
  }, []);
  const dismissBottomSheet = useCallback(() => {
    if (bottomSheetModalRef.current) {
      bottomSheetModalRef.current.dismiss();
    }
  }, []);
  const handleSheetChanges = useCallback((index: number) => {
    if (index === 0) {
      dismissBottomSheet();
    }
    console.log('handleSheetChanges', index);
  }, []);
  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop {...props} appearsOnIndex={1} />,
    []
  );

  if (!user || isLoading) {
    return null;
  }

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            elevation: 0,
            backgroundColor: '#FFFCF7',
            shadowOpacity: 0,
            shadowColor: 'transparent',
          },
          cardStyle: { backgroundColor: '#FFFCF7' },
          cardShadowEnabled: false,
          gestureEnabled: false,
        }}
        initialRouteName={
          user?.resetPassword
            ? 'ResetPassword'
            : user?.profileCreated
            ? 'HomeTab'
            : 'Onboard'
        }
      >
        <Stack.Screen
          name='HomeTab'
          component={HomeTabScreen}
          options={({ navigation, route }) => ({
            headerLeft: () => <Text style={styles.title}>OneCase</Text>,
            headerRight: () => (
              <View style={{ flexDirection: 'row' }}>
                <View style={{ marginRight: 10 }}>
                  <Pressable
                    style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1.0 })}
                    onPress={() => navigation.navigate('Notifications')}
                  >
                    <Ionicons name='notifications-outline' size={35} />
                    {notificationCount !== 0 ? (
                      <View
                        style={{
                          height: 10,
                          width: 10,
                          borderRadius: 5,
                          backgroundColor: 'red',
                          position: 'absolute',
                          top: 5,
                          right: 5,
                        }}
                      />
                    ) : null}
                  </Pressable>
                </View>
                <Pressable
                  style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1.0 })}
                  onPress={showBottomSheet}
                >
                  <Ionicons name='ios-reorder-three' size={35} />
                </Pressable>
              </View>
            ),
            title: '',
          })}
        />
        <Stack.Screen
          name='Onboard'
          component={OnboardStack}
          options={({ navigation, route }) => ({
            title: '',
            headerStyle: {
              elevation: 0,
              backgroundColor: '#FFFCF7',
              shadowOpacity: 0,
              shadowColor: 'transparent',
            },
            cardStyle: { backgroundColor: '#FFFCF7' },
            cardShadowEnabled: false,
            gestureEnabled: false,
            headerLeft: () => {
              if (getRouteName(route) !== 'Contacts') {
                return (
                  <Button
                    icon={
                      <Ionicons name='chevron-back' size={24} color='black' />
                    }
                    type='clear'
                    onPress={() => {
                      navigation.goBack();
                    }}
                  />
                );
              }
            },
          })}
        />
        <Stack.Screen
          name='ResetPassword'
          component={ResetPasswordScreen}
          options={({ navigation }) => ({
            title: '',
          })}
        />
        <Stack.Screen
          name='CreateTask'
          component={CreateTaskScreen}
          options={({ navigation, route }) => ({
            title: '',
          })}
        />
        <Stack.Screen
          name='EditTask'
          component={EditTaskScreen}
          options={({ navigation, route }) => ({
            headerLeft: () => (
              <Button
                icon={<Ionicons name='chevron-back' size={24} color='black' />}
                type='clear'
                titleStyle={styles.cancel}
                onPress={() => {
                  if (navigation.canGoBack()) navigation.goBack();
                }}
              />
            ),
            title: '',
          })}
        />
        <Stack.Screen
          name='SelectCase'
          component={SelectCaseScreen}
          options={({ navigation, route }) => ({
            headerLeft: () => (
              <Button
                icon={<Ionicons name='chevron-back' size={24} color='black' />}
                type='clear'
                titleStyle={styles.cancel}
                onPress={() => {
                  if (navigation.canGoBack()) navigation.goBack();
                }}
              />
            ),
            title: '',
          })}
        />
        <Stack.Screen
          name='CreateCase'
          component={CreateCaseScreen}
          options={({ navigation, route }) => ({
            headerLeft: () => (
              <Button
                // icon={<Ionicons name='chevron-back' size={24} color='black' />}
                type='clear'
                titleStyle={styles.cancel}
                title='Cancel'
                onPress={() => {
                  if (navigation.canGoBack()) navigation.goBack();
                }}
              />
            ),
            title: '',
          })}
        />
        <Stack.Screen
          name='UpdateCase'
          component={UpdateCaseScreen}
          options={({ navigation, route }) => ({
            headerLeft: () => (
              <Button
                // icon={<Ionicons name='chevron-back' size={24} color='black' />}
                type='clear'
                titleStyle={styles.cancel}
                title='Cancel'
                onPress={() => {
                  if (navigation.canGoBack()) navigation.goBack();
                }}
              />
            ),
            title: '',
          })}
        />
        <Stack.Screen
          name='AssignTask'
          component={AssignTaskScreen}
          options={({ navigation, route }) => ({
            headerLeft: () => (
              <Button
                icon={<Ionicons name='chevron-back' size={24} color='black' />}
                type='clear'
                titleStyle={styles.cancel}
                onPress={() => navigation.navigate('CreateTask')}
              />
            ),
            headerTitle: '',
            headerRight: () => (
              <Button title='Next' titleStyle={styles.confirm} type='clear' />
            ),
          })}
        />
        <Stack.Screen
          name='AssignTaskSelectCase'
          component={AssignTaskSelectCaseScreen}
          options={({ navigation, route }) => ({
            headerLeft: () => (
              <Button
                icon={<Ionicons name='chevron-back' size={24} color='black' />}
                type='clear'
                titleStyle={styles.cancel}
                onPress={() => navigation.goBack()}
              />
            ),
            headerTitle: '',
          })}
        />
        <Stack.Screen
          name='PreviewTask'
          component={PreviewTaskScreen}
          options={({ navigation, route }) => ({
            headerLeft: () => (
              <Button
                icon={<Ionicons name='chevron-back' size={24} color='black' />}
                type='clear'
                titleStyle={styles.cancel}
                onPress={() => navigation.navigate('CreateTask')}
              />
            ),
            headerTitle: '',
            headerRight: () => (
              <Button
                title='Next'
                titleStyle={styles.confirm}
                type='clear'
                onPress={() => navigation.navigate('AssignCouncil')}
              />
            ),
          })}
        />
        <Stack.Screen
          name='AssignCouncil'
          component={AssignCouncilScreen}
          options={({ navigation, route }) => ({
            headerLeft: () => (
              <Button
                icon={<Ionicons name='chevron-back' size={24} color='black' />}
                type='clear'
                titleStyle={styles.cancel}
                onPress={() => navigation.navigate('CreateTask')}
              />
            ),
            headerTitle: '',
            headerRight: () => (
              <Button title='Next' titleStyle={styles.confirm} type='clear' />
            ),
          })}
        />
        <Stack.Screen
          name='Task'
          component={TaskScreen}
          options={({ navigation, route }) => ({
            headerLeft: () => (
              <Button
                icon={<Ionicons name='chevron-back' size={24} color='black' />}
                type='clear'
                titleStyle={styles.cancel}
                onPress={() => {
                  if (navigation.canGoBack()) navigation.goBack();
                }}
              />
            ),
            headerTitle: '',
          })}
        />
        <Stack.Screen
          name='Comments'
          component={CommentsScreen}
          options={({ navigation, route }) => ({
            headerLeft: () => (
              <Button
                icon={<Ionicons name='chevron-back' size={24} color='black' />}
                type='clear'
                titleStyle={styles.cancel}
                onPress={() => {
                  if (navigation.canGoBack()) navigation.goBack();
                }}
              />
            ),
            title: 'Comments',
            headerTitleStyle: styles.headerTitle,
          })}
        />
        <Stack.Screen
          name='TaskUpdates'
          component={TaskUpdatesScreen}
          options={({ navigation, route }) => ({
            headerLeft: () => (
              <Button
                icon={<Ionicons name='chevron-back' size={24} color='black' />}
                type='clear'
                titleStyle={styles.cancel}
                onPress={() => {
                  if (navigation.canGoBack()) navigation.goBack();
                }}
              />
            ),
            headerTitle: '',
          })}
        />
        <Stack.Screen
          name='ClockIn'
          component={ClockInScreen}
          options={({ navigation, route }) => ({
            headerLeft: () => (
              <Button
                icon={<Ionicons name='chevron-back' size={24} color='black' />}
                type='clear'
                titleStyle={styles.cancel}
                onPress={() => {
                  if (navigation.canGoBack()) navigation.goBack();
                }}
              />
            ),
            headerTitle: '',
          })}
        />
        <Stack.Screen
          name='TaskProgress'
          component={TaskProgressScreen}
          options={({ navigation, route }) => ({
            headerLeft: () => (
              <Button
                icon={<Ionicons name='chevron-back' size={24} color='black' />}
                type='clear'
                titleStyle={styles.cancel}
                onPress={() => {
                  if (navigation.canGoBack()) navigation.goBack();
                }}
              />
            ),
            headerTitle: '',
          })}
        />
        <Stack.Screen
          name='AddFriends'
          component={AddFriendsScreen}
          options={({ navigation, route }) => ({
            headerLeft: () => (
              <Button
                icon={<Ionicons name='chevron-back' size={24} color='black' />}
                type='clear'
                titleStyle={styles.cancel}
                onPress={() => {
                  if (navigation.canGoBack()) navigation.goBack();
                }}
              />
            ),
            headerTitle: '',
          })}
        />
        <Stack.Screen
          name='EditProfile'
          component={EditProfileScreen}
          options={({ navigation, route }) => ({
            headerLeft: () => (
              <Button
                // icon={<Ionicons name='chevron-back' size={24} color='black' />}
                type='clear'
                titleStyle={styles.cancel}
                title='Cancel'
                onPress={() => {
                  if (navigation.canGoBack()) navigation.goBack();
                }}
              />
            ),
            headerTitle: '',
          })}
        />
        <Stack.Screen
          name='UserProfile'
          component={UserProfileScreen}
          options={({ navigation, route }) => ({
            headerLeft: () => (
              <Button
                icon={<Ionicons name='chevron-back' size={24} color='black' />}
                type='clear'
                titleStyle={styles.cancel}
                onPress={() => {
                  if (navigation.canGoBack()) navigation.goBack();
                }}
              />
            ),
            headerTitle: '',
          })}
        />
        <Stack.Screen
          name='Notifications'
          component={NotificationsScreen}
          options={({ navigation, route }) => ({
            headerLeft: () => (
              <Button
                icon={<Ionicons name='chevron-back' size={24} color='black' />}
                type='clear'
                titleStyle={styles.cancel}
                onPress={() => {
                  if (navigation.canGoBack()) navigation.goBack();
                }}
              />
            ),
            title: 'Notifications',
            headerTitleStyle: styles.headerTitle,
          })}
        />
        <Stack.Screen
          name='Requests'
          component={RequestsScreen}
          options={({ navigation, route }) => ({
            headerLeft: () => (
              <Button
                icon={<Ionicons name='chevron-back' size={24} color='black' />}
                type='clear'
                titleStyle={styles.cancel}
                onPress={() => {
                  if (navigation.canGoBack()) navigation.goBack();
                }}
              />
            ),
            title: 'Requests',
            headerTitleStyle: styles.headerTitle,
          })}
        />
        <Stack.Screen
          name='Settings'
          component={SettingsScreen}
          options={({ navigation, route }) => ({
            headerLeft: () => (
              <Button
                icon={<Ionicons name='chevron-back' size={24} color='black' />}
                type='clear'
                titleStyle={styles.cancel}
                onPress={() => {
                  if (navigation.canGoBack()) navigation.goBack();
                }}
              />
            ),
            title: 'Settings',
            headerTitleStyle: styles.headerTitle,
          })}
        />
        <Stack.Screen
          name='DeleteAccount'
          component={DeleteAccountScreen}
          options={({ navigation, route }) => ({
            headerLeft: () => (
              <Button
                icon={<Ionicons name='chevron-back' size={24} color='black' />}
                type='clear'
                titleStyle={styles.cancel}
                onPress={() => {
                  if (navigation.canGoBack()) navigation.goBack();
                }}
              />
            ),
            title: 'Settings',
            headerTitleStyle: styles.headerTitle,
          })}
        />
      </Stack.Navigator>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        onChange={handleSheetChanges}
      >
        <View style={{ flex: 1 }}>
          <View style={{ paddingLeft: 20, marginTop: 15 }}>
            <Avatar.Image source={{ uri: user?.avatarUrl }} />
            <Title style={styles.name}>
              {user?.firstName} {user?.lastName}
            </Title>
            <Caption style={styles.username}>@{user?.username}</Caption>
          </View>
          <View style={{ marginTop: 15 }}>
            <DrawerItem
              icon={({ color, size }) => (
                <Ionicons name='settings-outline' size={size} color={color} />
              )}
              label='Settings'
              labelStyle={styles.itemLabel}
              onPress={() => {
                dismissBottomSheet();
                navigation.navigate('Settings');
              }}
            />
          </View>
          <View
            style={{
              backgroundColor: '#585858',
              padding: 20,
              alignItems: 'flex-start',
            }}
          >
            <Text style={styles.needPartners}>
              Need Accountability Partners?
            </Text>
            <IconButton
              icon={
                <Ionicons name='person-add-sharp' size={24} color='white' />
              }
              textStyle={{ fontSize: 18 }}
              onPress={() => {
                dismissBottomSheet();
                navigation.navigate('AddFriends');
              }}
            >
              Add Friends
            </IconButton>
          </View>
          <DrawerItem
            label='Sign Out'
            labelStyle={styles.itemLabel}
            onPress={() => {
              dismissBottomSheet();
              signOut();
            }}
          />
        </View>
      </BottomSheetModal>
    </>
  );
};

function SignInStack() {
  const navigationRef = useRef<NavigationContainerRef>(null);
  const routeNameRef = useRef<string>();
  const mixpanel = useMixpanel();
  const { user } = useUser();

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState.match(/inactive|background/)) {
      mixpanel?.track('Left screen', { 'Screen Name': routeNameRef.current });
    }
  };

  useEffect(() => {
    mixpanel?.identify(user?.id);
    mixpanel?.people_set({
      $email: user?.email,
      $phone: user?.phone,
      $first_name: user?.firstName,
      $last_name: user?.lastName,
      $username: user?.username,
      $created: new Date(),
    });
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
      <Drawer.Navigator
        screenOptions={{ swipeEnabled: false }}
        drawerStyle={{ width: 330 }}
        drawerContent={(props) => <DrawerContent {...props} />}
      >
        <Drawer.Screen name='Main' component={Main} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = EStyleSheet.create({
  name: {
    fontSize: 20,
    fontFamily: '$boldFont',
  },
  username: {
    fontSize: 15,
    fontFamily: '$normalFont',
  },
  title: {
    fontFamily: 'montserrat-extrabold',
    fontSize: 32,
    color: '$blueberry',
    marginLeft: 15,
  },
  headerTitle: {
    fontFamily: '$boldFont',
    fontSize: 24,
  },
  cancel: {
    marginLeft: 10,
    color: '#747474',
    fontFamily: '$normalFont',
  },
  confirm: {
    marginRight: 10,
    color: '#000000',
    fontFamily: '$normalFont',
  },
  itemLabel: {
    fontSize: 18,
    fontFamily: '$semiboldFont',
  },
  needPartners: {
    color: 'white',
    marginBottom: 10,
    fontFamily: '$semiboldFont',
    fontSize: 18,
  },
});

export default SignInStack;
