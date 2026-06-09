import React from 'react';
import { View, Text, Pressable } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Notification, User } from '../types';
import useAddUserRelationship from '../mutations/useAddUserRelationship';
import { useUser } from '../providers/UserContext';
import RequestItem from './RequestItem';
import useUserProfile from '../queries/useUserProfile';
import useDeleteNotification from '../mutations/useDeleteNotification';
import IconButton from './IconButton';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from 'react-native-elements';
import { useMixpanel } from '../providers/MixpanelContext';

interface Props {
  request: Notification;
  listItem?: boolean;
}

const AddFriendItem = ({ request, listItem = false }: Props) => {
  const { senderId } = request;
  const { data, isLoading, isError } = useUserProfile(senderId);
  const { user } = useUser();
  const addUserRelationshipMutation = useAddUserRelationship();
  const deleteNotificationMutation = useDeleteNotification(request.id);
  const mixpanel = useMixpanel();

  const handleDecline = async () => {
    mixpanel?.track('Declined friend', {
      Adder: request.senderId,
      Added: user?.id,
    });
    await addUserRelationshipMutation.mutate({
      userId: request.senderId,
      status: 'cancel',
    });
    await deleteNotificationMutation.mutate();
  };

  const handleConfirm = async () => {
    mixpanel?.track('Accepted friend', {
      Adder: request.senderId,
      Added: user?.id,
    });
    await addUserRelationshipMutation.mutate({
      userId: request.senderId,
      status: 'friends',
    });
    await deleteNotificationMutation.mutate();
  };

  if (isLoading) {
    return null;
  }
  if (isError) {
    return null;
  }

  const ListItem = () => (
    <View style={styles.item}>
      <View style={styles.userInfo}>
        <Avatar
          size='medium'
          rounded
          source={{ uri: data?.avatarUrl }}
          icon={{
            name: 'user-circle',
            type: 'font-awesome',
            color: 'black',
          }}
          activeOpacity={0.7}
        />
        <View style={styles.text}>
          <Text style={styles.nameText}>{data?.firstName}</Text>
          <Text style={styles.usernameText}>{data?.username}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <IconButton
          type='primary'
          icon={<Ionicons name='person-add-sharp' size={24} color='white' />}
          onPress={handleConfirm}
          textStyle={styles.buttonText}
        >
          Accept
        </IconButton>
        <Pressable
          style={({ pressed }) => ({
            opacity: pressed ? 0.4 : 1.0,
            marginLeft: 10,
          })}
          onPress={handleDecline}
        >
          <Ionicons name='close' size={24} color='#9E8F8F' />
        </Pressable>
      </View>
    </View>
  );
  if (listItem) {
    return <ListItem />;
  }
  return (
    <RequestItem
      sender={data as User}
      text={
        <Text>
          <Text style={styles.bold}>{data?.firstName}</Text>{' '}
          <Text style={styles.coloredBold}>added</Text> you as a friend
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
  item: {
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E5E5E5',
    borderBottomWidth: 1,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    padding: 5,
  },
  text: {
    marginLeft: 10,
  },
  nameText: {
    color: '#323232',
    fontFamily: '$boldFont',
  },
  usernameText: {
    color: '#9E9E9E',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default AddFriendItem;
