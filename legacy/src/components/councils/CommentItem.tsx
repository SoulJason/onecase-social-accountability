import React from 'react';
import { View, Text } from 'react-native';
import { Avatar } from 'react-native-elements';
import { Comment } from '../../types';

const user = {
  profilePicture: 'https://randomuser.me/api/portraits/men/57.jpg',
};
const CommentItem = ({ item }: { item: Comment }) => {
  return (
    <View style={{ flexDirection: 'row' }}>
      <Avatar
        size='small'
        rounded
        source={{ uri: user.profilePicture }}
        containerStyle={{
          top: -5,
        }}
      />
      <Text style={{ marginLeft: 5 }}>{item.comment}</Text>
    </View>
  );
};

export default CommentItem;
