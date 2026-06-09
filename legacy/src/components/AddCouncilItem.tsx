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
import useAcceptCouncil from '../mutations/useAcceptCouncil';
import useCaseByCaseId from '../queries/useCaseByCaseId';
import { useNavigation } from '@react-navigation/native';

interface Props {
  request: Notification;
}

const AddCouncilItem = ({ request }: Props) => {
  const navigation = useNavigation();
  const { senderId } = request;
  const { data, isLoading, isError } = useUserProfile(senderId);

  const {
    data: caseItem,
    isLoading: isCaseLoading,
    isError: isCaseError,
  } = useCaseByCaseId(request.caseId ?? -1);
  const acceptCouncilMutation = useAcceptCouncil(request.caseId ?? -1);
  const deleteNotificationMutation = useDeleteNotification(request.id);

  const handleDecline = async () => {
    await deleteNotificationMutation.mutate();
  };

  const handleConfirm = async () => {
    await acceptCouncilMutation.mutate();
    await deleteNotificationMutation.mutate();
  };

  if (isLoading || isCaseLoading) {
    return null;
  }
  if (isError || isCaseError) {
    return null;
  }
  return (
    <RequestItem
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
          invites you to their council for breh moment{' '}
          <Text style={styles.coloredBold}>{caseItem?.title}</Text>
        </Text>
      }
      onDecline={handleDecline}
      onConfirm={handleConfirm}
    />
  );
};

const styles = EStyleSheet.create({
  bold: {
    fontFamily: '$boldFont',
  },
  coloredBold: {
    fontFamily: '$boldFont',
    color: '#FF6363',
  },
  taskTitleContainer: {
    padding: 5,
  },
  taskTitleText: {
    fontFamily: '$boldFont',
    color: '#FFFFFF',
  },
  taskDescriptionContainer: {
    padding: 5,
  },
  taskDescriptionText: {
    fontFamily: '$normalFont',
  },
});

export default AddCouncilItem;
