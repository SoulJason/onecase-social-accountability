import React from 'react';
import { View, Text, Pressable } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Notification, User } from '../types';
import { useUser } from '../providers/UserContext';
import RequestItem from './RequestItem';
import useUserProfile from '../queries/useUserProfile';
import useAcceptTask from '../mutations/useAcceptTask';
import useDeleteTask from '../mutations/useDeleteTask';
import useTaskByTaskId from '../queries/useTaskByTaskId';
import useDeleteNotification from '../mutations/useDeleteNotification';
import NotificationItem from './NotificationItem';
import { useNavigation } from '@react-navigation/native';
import fromNow from '../utils/fromNow';
import { useMixpanel } from '../providers/MixpanelContext';

interface Props {
  request: Notification;
}

const NudgeNotification = ({ request }: Props) => {
  const { senderId, count, id } = request;
  const navigation = useNavigation();
  const { data, isLoading, isError } = useUserProfile(senderId);
  const { user } = useUser();
  const {
    data: task,
    isLoading: isTaskLoading,
    isError: isTaskError,
  } = useTaskByTaskId(request.taskId ?? -1);
  const mixpanel = useMixpanel();

  if (isLoading || isTaskLoading) {
    return null;
  }
  if (isError || isTaskError) {
    return null;
  }
  let countText = '';
  if (count) {
    if (count > 1 && count <= 100) {
      countText = `${count}x `;
    } else if (count > 100) {
      countText = `100x+ `;
    }
  }

  return (
    <NotificationItem
      id={id}
      sender={data as User}
      text={
        <Text>
          <Text
            style={styles.bold}
            onPress={() =>
              navigation.navigate('UserProfile', { userId: data?.id })
            }
          >
            {data?.firstName}
          </Text>{' '}
          nudged you{' '}
          {countText !== '' ? (
            <Text style={styles.count}>{countText}</Text>
          ) : null}
          for
          {'\n'}
          <Text style={styles.coloredBold}>{task?.title}</Text>{' '}
          <Text style={styles.timestamp}>{fromNow(request.createdAt)}</Text>
        </Text>
      }
      button={
        <Pressable
          style={({ pressed }) => [
            styles.clock,
            { opacity: pressed ? 0.4 : 1.0 },
          ]}
          onPress={() => {
            mixpanel?.track('Pressed clock button', {
              Screen: 'Notifications',
              Assigner: task?.assigner.id,
              Assignee: user?.id,
            });
            navigation.navigate('ClockIn', {
              task,
            });
          }}
        >
          <Text>⏰</Text>
        </Pressable>
      }
    />
  );
};

const styles = EStyleSheet.create({
  bold: {
    fontFamily: '$boldFont',
  },
  coloredBold: {
    fontFamily: '$boldFont',
    color: '#7189FF',
  },
  count: {
    fontFamily: '$semiboldFont',
    color: '#FF5757',
  },
  clock: {
    backgroundColor: '$grannySmithApple',
    padding: 10,
    borderRadius: 999,
    justifyContent: 'center',
  },
  timestamp: {
    fontFamily: '$normalFont',
    color: '#8B8B8B',
  },
});

export default NudgeNotification;
