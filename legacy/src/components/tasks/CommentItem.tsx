import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Avatar } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Comment } from '../../types';
import fromNow from '../../utils/fromNow';
import { useNavigation } from '@react-navigation/native';

interface Props {
  comment: Comment;
}

const CommentItem = ({ comment }: Props) => {
  const { user } = comment;
  const navigation = useNavigation();

  return (
    <View style={styles.item}>
      <View style={styles.comment}>
        <View style={styles.avatar}>
          <Pressable
            onPress={() =>
              navigation.navigate('UserProfile', { userId: user.id })
            }
          >
            <Avatar
              size='small'
              rounded
              source={{ uri: user.avatarUrl }}
              icon={{
                name: 'user-circle',
                type: 'font-awesome',
                color: 'black',
              }}
              activeOpacity={0.7}
            />
          </Pressable>
        </View>
        <View style={styles.textContainer}>
          <View style={styles.messageContainer}>
            <Text>
              <Text
                onPress={() =>
                  navigation.navigate('UserProfile', { userId: user.id })
                }
                style={styles.name}
              >
                {user.firstName}
              </Text>

              {'   '}
              <Text style={styles.message}>{comment.message}</Text>
            </Text>
          </View>
          <View>
            <Text style={styles.timestamp}>
              {fromNow(comment.createdAt, true)}
            </Text>
          </View>
        </View>
        {/* <View style={styles.userTextContainer}>
       
         
        </View>
        <View style={styles.textContainer}>
        
        </View> */}
      </View>
    </View>
  );
};

const styles = EStyleSheet.create({
  item: {
    flex: 1,
    padding: 5,
    flexDirection: 'row',
  },
  comment: {
    flex: 1,
    flexDirection: 'row',
    padding: 5,
  },
  avatar: {
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 5,
  },
  messageContainer: {
    flexDirection: 'row',
  },
  name: {
    fontFamily: '$boldFont',
  },
  timestamp: {
    fontFamily: '$normalFont',
    color: '#838383',
  },
  utextContainer: {
    marginLeft: 10,
    // justifyContent: 'flex-start',
    flexShrink: 1,
    // flexDirection: 'row',
    // flex: 1,
    // flexGrow: 1,
    // width: 0,
  },
  message: {
    fontFamily: '$normalFont',
    flex: 1,
    // flexWrap: 'wrap',
    // flex: 1,
    // flexShrink: 1,
  },
});

export default CommentItem;
