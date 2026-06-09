import React from 'react';
import { FlatList } from 'react-native';
import { Update } from '../../types';
import UpdateItem from './UpdateItem';

interface Props {
  updates: Update[];
  isPreview?: boolean;
  scrollEnabled?: boolean;
}

const UpdateList = ({ updates, isPreview, scrollEnabled = true }: Props) => {
  let sortedUpdates = updates.sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0
  );
  if (isPreview) {
    sortedUpdates = sortedUpdates.slice(0, 2);
  }

  const renderUpdateItem = ({ item }: { item: Update }) => {
    return <UpdateItem update={item} />;
  };

  return (
    <FlatList
      scrollEnabled={scrollEnabled}
      data={sortedUpdates}
      renderItem={renderUpdateItem}
      keyExtractor={(item) => `${item.id}`}
    />
  );
};

export default UpdateList;
