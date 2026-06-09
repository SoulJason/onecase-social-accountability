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
import { useNavigation } from '@react-navigation/native';

interface Props {
  request: Notification;
}

const AssignTaskItem = ({ request }: Props) => {
  const navigation = useNavigation();
  const { senderId } = request;
  const { data, isLoading, isError } = useUserProfile(senderId);
  const { user } = useUser();
  const {
    data: task,
    isLoading: isTaskLoading,
    isError: isTaskError,
  } = useTaskByTaskId(request.taskId ?? -1);
  const declineTaskMutation = useDeleteTask(request.taskId ?? -1);
  const acceptTaskMutation = useAcceptTask(
    request.taskId ?? -1,
    user?.id ?? ''
  );
  const deleteNotificationMutation = useDeleteNotification(request.id);

  const handleDecline = async () => {
    await declineTaskMutation.mutate();
    await deleteNotificationMutation.mutate();
  };

  const handleConfirm = async () => {
    await acceptTaskMutation.mutate();
    await deleteNotificationMutation.mutate();
  };

  if (isLoading || isTaskLoading) {
    return null;
  }
  if (isError || isTaskError) {
    return null;
  }
  return (
    <RequestItem
      sender={data as User}
      text={
        <View>
          <Text>
            <Text
              style={styles.bold}
              onPress={() =>
                navigation.navigate('UserProfile', { userId: data?.id })
              }
            >
              {data?.firstName}
            </Text>{' '}
            <Text style={[styles.coloredBold, { color: task?.caseItem.color }]}>
              proposes
            </Text>{' '}
            you this task
          </Text>
          <View style={styles.caseInfo}>
            <View
              style={[
                styles.caseEmoji,
                { backgroundColor: task?.caseItem.color },
              ]}
            >
              <Text>{task?.caseItem.emoji}</Text>
            </View>
            <Text style={styles.caseTitleText}>{task?.caseItem.title}</Text>
          </View>
        </View>
      }
      onDecline={handleDecline}
      onConfirm={handleConfirm}
    >
      <View>
        <View style={[styles.taskTitleContainer]}>
          <Text style={styles.taskTitleText}>{task?.title}</Text>
        </View>
        {task?.description ? (
          <View style={styles.taskDescriptionContainer}>
            <Text style={styles.taskDescriptionText}>{task?.description}</Text>
          </View>
        ) : null}
      </View>
    </RequestItem>
  );
};

const styles = EStyleSheet.create({
  bold: {
    fontFamily: '$boldFont',
  },
  coloredBold: {
    fontFamily: '$boldFont',
  },
  caseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caseEmoji: {
    borderRadius: 10,
    padding: 5,
  },
  caseTitleText: {
    fontFamily: '$boldFont',
    marginLeft: 5,
  },
  taskTitleContainer: {
    padding: 5,
  },
  taskTitleText: {
    fontFamily: '$boldFont',
    color: '#000',
  },
  taskDescriptionContainer: {
    padding: 5,
  },
  taskDescriptionText: {
    fontFamily: '$normalFont',
  },
});

export default AssignTaskItem;
