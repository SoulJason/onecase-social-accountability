import React, { useState, useEffect } from 'react';
import { ScrollView, FlatList, RefreshControl } from 'react-native';
import CaseItem from './CaseItem';
import { Case } from '../../types';
import { fetchCases, fetchTodos } from '../../lib/supabase/store';
import TodoItem from './TodoItem';

const CaseList = ({ navigation }: any) => {
  const [cases, setCases] = useState<Case[]>();
  const [refreshing, setRefreshing] = useState(false);

  async function loadCases() {
    const data = await fetchCases();
    setCases(data as Case[]);
  }

  useEffect(() => {
    loadCases();
  }, []);

  const renderCaseItem = ({ item }: { item: Case }) => {
    return (
      <CaseItem
        caseItem={item}
        navigation={navigation}
        refreshing={refreshing}
        onFinishRefresh={() => setRefreshing(false)}
      />
    );
  };

  const refresh = () => {
    setRefreshing(true);
    loadCases();
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
      }
    >
      <TodoItem navigation={navigation} />
      <FlatList
        data={cases}
        renderItem={renderCaseItem}
        keyExtractor={(item) => item.title}
        extraData={refreshing}
        listKey='cases'
      />
    </ScrollView>
  );
};

export default CaseList;
