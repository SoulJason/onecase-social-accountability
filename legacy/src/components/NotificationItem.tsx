import React from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { Avatar } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import EStyleSheet from 'react-native-extended-stylesheet';
import { NotificationType, User } from '../types';
import { useNavigation } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import useDeleteNotification from '../mutations/useDeleteNotification';
import Toast from 'react-native-toast-message';

interface Props {
  id: number;
  sender: User;
  text: string | React.ReactNode;
  button?: React.ReactNode;
}

const NotificationItem = ({ id, sender, text, button }: Props) => {
  const navigation = useNavigation();
  const deleteNotificationMutation = useDeleteNotification(id);

  const handleDelete = async () => {
    await deleteNotificationMutation.mutate();
    Toast.show({
      type: 'success',
      position: 'top',
      text1: 'Notification Deleted',
      topOffset: 50,
    });
  };
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation,
    dragX: Animated.AnimatedInterpolation
  ) => {
    return (
      <Pressable
        onPress={handleDelete}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.4 : 1.0,
            backgroundColor: '#FF6464',
            justifyContent: 'center',
            alignItems: 'center',
            height: 50,
            width: 50,
            alignSelf: 'center',
            marginRight: 2,
            borderRadius: 10,
          },
        ]}
      >
        <Ionicons name='trash-outline' size={24} color='white' />
      </Pressable>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
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
            // avatarStyle={{ width: 100, height: 100 }}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('UserProfile', { userId: sender.id })
            }
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text}>{text}</Text>
        </View>
        <View style={styles.button}>{button}</View>
      </View>
    </Swipeable>
  );
};

const styles = EStyleSheet.create({
  item: {
    flex: 1,
    padding: 5,
    flexDirection: 'row',
  },
  userInfo: {
    padding: 5,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  text: {
    color: '#000000',
  },
  button: {
    justifyContent: 'center',
  },
});

export default NotificationItem;
