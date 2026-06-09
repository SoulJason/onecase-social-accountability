import React, { useEffect } from 'react';
import { View, FlatList, TextInput } from 'react-native';
import CommentItem from './CommentItem';
import { Comment } from '../../types';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Avatar } from 'react-native-elements';

const comments: Comment[] = [
  {
    id: 1,
    inserted_at: new Date(),
    comment: 'I hate this class',
    userId: 'user1',
    caseId: '1',
  },
];

interface Props {
  caseId: number;
}
const CommentList = ({ caseId }: Props) => {
  useEffect(() => {
    // @TODO: fetch case's comments using caseId
  }, []);

  const renderCommentItem = ({ item }: { item: Comment }) => {
    return <CommentItem item={item} />;
  };
  return (
    <View>
      <FlatList
        data={comments}
        renderItem={renderCommentItem}
        keyExtractor={(item) => `${item.id}`}
        listKey={`${caseId}-council-cases-comments`}
      />
      <View style={{ flexDirection: 'row', marginTop: 15 }}>
        <Avatar
          size='small'
          rounded
          source={{ uri: 'https://randomuser.me/api/portraits/men/58.jpg' }}
        />
        <TextInput
          style={styles.commentInput}
          placeholder='Write a comment...'
        />
      </View>
    </View>
  );
};

const styles = EStyleSheet.create({
  commentInput: {
    borderRadius: 15,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#C4C4C4',
    fontFamily: '$normalFont',
    fontSize: 13,
    width: '80%',
    // marginTop: 10,
  },
});

export default CommentList;
