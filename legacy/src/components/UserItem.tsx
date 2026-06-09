import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Avatar } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import EStyleSheet from 'react-native-extended-stylesheet';
import { User } from '../lib/supabase/store';

interface Props {
  item: User;
  onPress: () => void;
  backgroundColor: { backgroundColor: string };
}

const UserItem = ({ item, onPress, backgroundColor }: Props) => {
  return (
    <Pressable onPress={onPress} style={[styles.item, backgroundColor]}>
      <Avatar
        size='medium'
        rounded
        source={{ uri: item.avatarUrl }}
        icon={{
          name: 'user-circle',
          type: 'font-awesome',
          color: 'black',
        }}
        activeOpacity={0.7}
      >
        {item.selected && (
          <View style={styles.checkmarkIcon}>
            <Ionicons name='checkmark-circle-outline' size={24} color='white' />
            <Ionicons
              name='checkmark-circle'
              size={24}
              color='#7189FF'
              style={styles.checkmark}
            />
          </View>
        )}
      </Avatar>
      <Text style={styles.userText}>{item.username}</Text>
    </Pressable>
  );
};

const styles = EStyleSheet.create({
  item: {
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userText: {
    color: 'white',
    fontFamily: '$boldFont',
    marginLeft: 10,
  },
  checkmarkIcon: {
    position: 'absolute',
    top: -3,
    right: -5,
  },
  checkmark: {
    top: 0,
    left: 0,
    position: 'absolute',
    borderRadius: 9999,
  },
});

export default UserItem;
