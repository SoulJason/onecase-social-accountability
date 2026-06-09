import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, Text, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import ShadowStyle from '../constants/ShadowStyle';
import { CaseUpdate, CaseUpdateItem } from '../types';
import CaseUpdateItemComponent from './CaseUpdateItem';

interface Props {
  isPublic?: boolean;
  caseUpdates: CaseUpdate[];
}

const CaseUpdateList = ({ isPublic = true, caseUpdates }: Props) => {
  const navigation = useNavigation();
  const renderCaseUpdate = ({ item }: { item: CaseUpdate }) => {
    const renderCaseUpdateItem = ({
      item: caseUpdateItem,
    }: {
      item: CaseUpdateItem;
    }) => {
      return (
        <CaseUpdateItemComponent
          caseUpdateItem={caseUpdateItem}
          caseItem={item as any}
          navigation={navigation}
          isPublic={isPublic}
          // refreshing={refreshing}
          // onFinishRefresh={() => setRefreshing(false)}
        />
      );
    };
    return (
      <View style={styles.caseUpdateList}>
        <View style={[styles.emojiContainer, { backgroundColor: item.color }]}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <FlatList
          data={item.updates}
          renderItem={renderCaseUpdateItem}
          keyExtractor={(item) => `${item.createdAt}`}
        />
      </View>
    );
  };

  return (
    <FlatList
      data={caseUpdates}
      renderItem={renderCaseUpdate}
      keyExtractor={(item) => `${item.id}`}
      // refreshControl={
      //   <RefreshControl refreshing={refreshing} onRefresh={refresh} />
      // }
    />
  );
};

const styles = EStyleSheet.create({
  caseUpdateList: {
    marginTop: 20,
  },
  emojiContainer: {
    alignSelf: 'flex-start',
    padding: 5,
    borderRadius: 8,
    ...ShadowStyle,
  },
  emoji: {
    fontSize: 30,
  },
  title: {
    fontSize: 22,
    fontFamily: '$boldFont',
    marginTop: 20,
    marginBottom: 10,
  },
});

export default CaseUpdateList;
