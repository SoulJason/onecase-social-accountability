import React from 'react';
import { FlatList } from 'react-native';
import CommentItem from './CommentItem';
import { Comment } from '../../types';
import EStyleSheet from 'react-native-extended-stylesheet';

interface Props {
  comments: Comment[] | undefined;
}

const CommentList = ({ comments }: Props) => {
  const renderCommentItem = ({ item }: { item: Comment }) => {
    return <CommentItem comment={item} />;
  };

  return (
    <FlatList
      data={comments}
      renderItem={renderCommentItem}
      keyExtractor={(item) => `${item.id}`}
    />
  );
};

export default CommentList;
