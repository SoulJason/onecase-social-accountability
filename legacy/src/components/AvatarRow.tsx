import React from 'react';
import { View, Text } from 'react-native';
import { Avatar } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';
import { User } from '../types';

interface Props {
  users: User[];
  placement?: number;
  additionalUsers?: number;
}
const AvatarRow = ({ users, placement, additionalUsers }: Props) => {
  return (
    <View
      style={{
        flexDirection: 'row',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          right: placement,
        }}
      >
        {users.map((user, index) => {
          return (
            <Avatar
              key={user.id}
              size='small'
              rounded
              source={{ uri: user.avatarUrl }}
              containerStyle={{
                top: -5,
                right: (index + 1) * 15,
              }}
            />
          );
        })}
      </View>
      {additionalUsers && additionalUsers ? (
        <Text style={styles.additionalUsers}>+{additionalUsers}</Text>
      ) : null}
    </View>
  );
};

const styles = EStyleSheet.create({
  additionalUsers: {
    fontSize: '$heading',
    fontFamily: '$boldFont',

    right: 15,
  },
});

export default AvatarRow;
