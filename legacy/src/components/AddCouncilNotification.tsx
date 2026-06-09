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
import useCaseByCaseId from '../queries/useCaseByCaseId';

interface Props {
  request: Notification;
}

const AddCouncilNotification = ({ request }: Props) => {
  const { senderId, id } = request;
  const navigation = useNavigation();
  const { data, isLoading, isError } = useUserProfile(senderId);
  const { user } = useUser();

  const {
    data: caseItem,
    isLoading: isCaseLoading,
    isError: isCaseError,
  } = useCaseByCaseId(request.caseId ?? -1);
  if (isLoading || isCaseLoading) {
    return null;
  }
  if (isError || isCaseError) {
    return null;
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
          added you to their council for{' '}
          <Text style={styles.coloredBold}>{caseItem?.title}</Text>
          {/* <Text style={styles.coloredBold}>{task?.title}</Text> */}
        </Text>
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
    color: '#FF6363',
  },
  clock: {
    backgroundColor: '$grannySmithApple',
    height: '100%',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    padding: 10,
  },
});

export default AddCouncilNotification;
