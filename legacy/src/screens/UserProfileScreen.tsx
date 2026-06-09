import { StackNavigationProp } from '@react-navigation/stack';
import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { Avatar, Title, Caption } from 'react-native-paper';
import Button from '../components/Button';
import CaseUpdateList from '../components/CaseUpdateList';
import { StackParamList } from '../navigation/SignInStack';

import { Case, CaseUpdate, User } from '../types';
import { RouteProp } from '@react-navigation/native';
import useUserProfile from '../queries/useUserProfile';
import useUserProfileUpdates from '../queries/useUserProfileUpdates';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import Modal from '../components/Modal';
import useAddUserRelationship from '../mutations/useAddUserRelationship';
import Shadow from '../constants/ShadowStyle';
import ShadowStyle from '../constants/ShadowStyle';
import { sendPushNotification } from '../lib/supabase/store';
import ProfileScreen from './home/ProfileScreen';
import useCurrentUser from '../queries/useCurrentUser';
import { useUser } from '../providers/UserContext';
import { useMixpanel } from '../providers/MixpanelContext';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'UserProfile'>;
  route: RouteProp<StackParamList, 'UserProfile'>;
}

function UserProfileScreen({ navigation, route }: Props) {
  const { userId } = route.params;
  const { user: currentUser } = useUser();
  const { data: user, refetch: userRefetch } = useUserProfile(userId);
  const { data: userProfileData, refetch: userProfileUpdatesRefetch } =
    useUserProfileUpdates(userId);

  const addUserRelationshipMutation = useAddUserRelationship();
  // const { data } = useCaseUpdates();
  const [refreshing, setRefreshing] = useState(false);

  const [unfriendModalVisible, setUnfriendModalVisible] = useState(false);

  const userProfileUpdates = userProfileData?.caseUpdates;
  const caseItems = userProfileData?.caseItems;
  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const mixpanel = useMixpanel();

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      dismissBottomSheet();
    });

    return unsubscribe;
  }, [navigation]);
  // variables
  const snapPoints = useMemo(() => [1, '25%'], []);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await userRefetch();
    await userProfileUpdatesRefetch();
    setRefreshing(false);
  };

  const ActionButton = () => {
    switch (user?.relationshipStatus) {
      case 'friends': {
        return (
          <Button
            type='light'
            style={{
              elevation: 0,
              borderWidth: 1,
              paddingVertical: 1,
              borderRadius: 6,
            }}
            textStyle={{
              fontSize: 16,
            }}
            onPress={showBottomSheet}
            rightIcon={<Ionicons name='chevron-down' size={18} color='black' />}
          >
            Added
          </Button>
        );
      }
      case 'sent': {
        return (
          <Button
            type='light'
            style={{
              elevation: 0,
              borderWidth: 1,
              paddingVertical: 1,
              borderRadius: 6,
            }}
            textStyle={{
              fontSize: 16,
            }}
            onPress={showBottomSheet}
            rightIcon={<Ionicons name='chevron-down' size={18} color='black' />}
          >
            Sent
          </Button>
        );
      }
      case 'received': {
        return (
          <Button
            type='primary'
            style={{
              elevation: 0,
              borderWidth: 1,
              paddingVertical: 1,
              borderRadius: 6,
            }}
            textStyle={{
              fontSize: 16,
            }}
            onPress={async () => {
              await addUserRelationshipMutation.mutate({
                userId,
                status: 'friends',
              });
            }}
          >
            Accept
          </Button>
        );
      }
      case 'none': {
        return (
          <Button
            type='primary'
            style={{
              elevation: 0,
              borderWidth: 1,
              paddingVertical: 1,
              borderRadius: 6,
            }}
            textStyle={{
              fontSize: 16,
            }}
            onPress={async () => {
              await addUserRelationshipMutation.mutate({
                userId,
                status: 'pending',
              });
              await sendPushNotification(
                user.pushToken ?? '',
                userId,
                'add_friend',
                'OneCase Friend Request',
                `${user?.firstName} added you as a friend.`
              );
            }}
            rightIcon={
              <Ionicons
                name='md-person-add'
                size={18}
                color='white'
                style={{ marginLeft: 10 }}
              />
            }
          >
            Add
          </Button>
        );
      }
      default: {
        return <></>;
      }
    }
  };

  const BottomSheetContent = () => {
    switch (user?.relationshipStatus) {
      case 'friends': {
        return (
          <Pressable
            onPress={() => setUnfriendModalVisible(true)}
            style={({ pressed }) => [
              styles.contentContainer,
              {
                backgroundColor: pressed ? '#e0e0e0' : 'transparent',
              },
            ]}
          >
            <Ionicons name='person-remove-outline' size={24} color='black' />
            <Text style={styles.contentText}>Remove</Text>
          </Pressable>
        );
      }
      case 'sent': {
        return (
          <Pressable
            onPress={async () => {
              dismissBottomSheet();
              await addUserRelationshipMutation.mutate({
                userId,
                status: 'cancel',
              });
            }}
            style={({ pressed }) => [
              styles.contentContainer,
              {
                backgroundColor: pressed ? '#e0e0e0' : 'transparent',
              },
            ]}
          >
            <MaterialCommunityIcons name='cancel' size={24} color='black' />
            <Text style={styles.contentText}>Cancel Friend Request</Text>
          </Pressable>
        );
      }
      case 'received': {
        return <></>;
      }
      case 'none': {
        return <></>;
      }
      default: {
        return <></>;
      }
    }
  };

  if (userId === currentUser?.id) {
    return <ProfileScreen />;
  }
  return (
    <ScrollView
      style={{ flex: 1, height: '100%', marginTop: 10 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={{ flexDirection: 'column' }}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, paddingLeft: 20, marginTop: 15 }}>
            <Avatar.Image source={{ uri: user?.avatarUrl }} />
            <Title style={styles.name}>
              {user?.firstName} {user?.lastName}
            </Title>
            <Caption style={styles.username}>@{user?.username}</Caption>
          </View>
          <View
            style={{
              flex: 1,
              marginHorizontal: 30,
              // justifyContent: 'flex-end',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Pressable
                style={({ pressed }) => [
                  {
                    backgroundColor: '#FF7171',
                    borderRadius: 999,
                    alignSelf: 'center',
                    padding: 6,
                    opacity: pressed ? 0.4 : 1.0,
                    ...ShadowStyle,
                  },
                ]}
                onPress={() => {
                  mixpanel?.track('Pressed assign task', {
                    Assignee: user?.id,
                  });
                  mixpanel?.time_event('Assigned task');
                  navigation.navigate('AssignTask', {
                    assignee: user as User,
                    caseItem: user?.assignedTasksCase,
                    cases: [user?.assignedTasksCase as Case].concat(
                      caseItems as Case[]
                    ),
                  });
                }}
              >
                <Text style={{ fontSize: 24 }}>✍️</Text>
              </Pressable>
            </View>

            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
              <ActionButton />
            </View>
          </View>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '90%', paddingBottom: 25 }}>
            <CaseUpdateList caseUpdates={userProfileUpdates as CaseUpdate[]} />
          </View>
        </View>
      </View>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        onChange={handleSheetChanges}
      >
        <BottomSheetContent />
      </BottomSheetModal>
      <Modal
        visible={unfriendModalVisible}
        title={`Are you sure you want to remove ${user?.firstName} ${user?.lastName} as your friend?`}
        onNo={() => setUnfriendModalVisible(false)}
        onYes={async () => {
          setUnfriendModalVisible(false);
          dismissBottomSheet();
          await addUserRelationshipMutation.mutate({
            userId: user?.id ?? '',
            status: 'cancel',
          });
          // navigation.navigate('Friends');
        }}
        noText='Cancel'
        yesText='Confirm'
      />
    </ScrollView>
  );
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: 'grey',
  },
  contentContainer: {
    // flex: 1,
    padding: 10,
    // alignItems: 'center',
    flexDirection: 'row',
  },
  contentText: {
    fontSize: 18,
    marginLeft: 10,
  },
  name: {
    fontSize: 22,
    fontFamily: '$boldFont',
  },
  username: {
    fontSize: 15,
    fontFamily: '$normalFont',
  },
});

export default UserProfileScreen;
