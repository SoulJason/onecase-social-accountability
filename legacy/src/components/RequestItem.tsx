import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Avatar } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import EStyleSheet from 'react-native-extended-stylesheet';
import { NotificationType, User } from '../types';
import IconButton from './IconButton';
import useAddUserRelationship from '../mutations/useAddUserRelationship';
import { sendPushNotification } from '../lib/supabase/store';
import { useUser } from '../providers/UserContext';
import Button from './Button';
import { useNavigation } from '@react-navigation/native';

interface Props {
  sender: User;
  text: string | React.ReactNode;
  onDecline: () => void;
  onConfirm: () => void;
  children?: React.ReactNode;
}

const RequestItem = ({
  sender,
  text,
  onDecline,
  onConfirm,
  children,
}: Props) => {
  const navigation = useNavigation();

  return (
    <View style={styles.item}>
      <View style={styles.userInfo}>
        <Avatar
          size='medium'
          rounded
          source={{ uri: sender.avatarUrl }}
          icon={{
            name: 'user-circle',
            type: 'font-awesome',
            color: 'black',
          }}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate('UserProfile', { userId: sender.id })
          }
        />
        <View style={styles.textContainer}>{text}</View>
      </View>
      {children}
      <View style={styles.actions}>
        <Button
          type='light'
          style={{
            flex: 1,
            borderWidth: 1,
            paddingVertical: 5,
          }}
          textStyle={{
            fontSize: 16,
          }}
          onPress={onDecline}
        >
          Decline
        </Button>
        <Button
          style={{
            flex: 1,
            paddingVertical: 5,
          }}
          textStyle={{
            fontSize: 16,
          }}
          type='primary'
          onPress={onConfirm}
        >
          Confirm
        </Button>
      </View>
    </View>
  );
};

const styles = EStyleSheet.create({
  item: {
    flex: 1,
    padding: 5,
    marginVertical: 10,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    padding: 5,
  },
  textContainer: {
    marginLeft: 10,
  },
  text: {
    color: '#000000',
  },
  actions: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    marginTop: 5,
  },
});

export default RequestItem;
