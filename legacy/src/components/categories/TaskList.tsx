import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  FlatList,
  RefreshControl,
  View,
  Pressable,
  Text,
} from 'react-native';
import { Task } from '../../types';

import { fetchTasks } from '../../lib/supabase/store';
import TaskItem from './TaskItem';
import useTasks from '../../queries/useTasks';
import EStyleSheet from 'react-native-extended-stylesheet';
import TaskListSkeleton from '../TaskListSkeleton';
import { useMixpanel } from '../../providers/MixpanelContext';

const TaskList = ({ caseItem, navigation }: any) => {
  const [refreshing, setRefreshing] = useState(false);
  const { data, isLoading, isError, refetch } = useTasks(caseItem.id);
  const mixpanel = useMixpanel();

  const refresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderTaskItem = ({ item }: { item: Task }) => {
    return (
      <TaskItem
        caseItem={caseItem}
        task={item}
        navigation={navigation}
        // refreshing={refreshing}
        // onFinishRefresh={() => setRefreshing(false)}
      />
    );
  };

  const Title = () => {
    if (caseItem.title === 'Assigned Tasks') {
      return (
        <Pressable
          style={{
            marginTop: 20,
            marginBottom: 10,
          }}
        >
          <View
            style={{
              backgroundColor: caseItem.color,
              borderRadius: 10,
              padding: 5,
              marginHorizontal: 15,
            }}
          >
            <Text style={styles.caseTitle}>{caseItem.title}</Text>
          </View>
        </Pressable>
      );
    }
    return (
      <Pressable
        style={({ pressed }) => ({
          opacity: pressed ? 0.4 : 1.0,
          marginTop: 20,
          marginBottom: 10,
        })}
        onPress={() => navigation.navigate('UpdateCase', { caseItem })}
      >
        <View
          style={{
            backgroundColor: caseItem.color,
            borderRadius: 10,
            padding: 5,
            marginHorizontal: 15,
          }}
        >
          <Text style={styles.caseTitle}>{caseItem.title}</Text>
        </View>
      </Pressable>
    );
  };

  const AddTask = () => (
    <View style={{ marginVertical: 20, alignItems: 'center' }}>
      <Pressable
        style={({ pressed }) => ({
          opacity: pressed ? 0.4 : 1.0,
          backgroundColor: '#ABABAB',
          borderRadius: 10,
          paddingVertical: 5,
          paddingHorizontal: 10,
        })}
        onPress={() => {
          mixpanel?.time_event('Created task');
          mixpanel?.track('Pressed add task');
          navigation.navigate('CreateTask', { caseItem });
        }}
      >
        <Text style={styles.addTask}>Add Task +</Text>
      </Pressable>
    </View>
  );

  if (isLoading) {
    return <TaskListSkeleton />;
  }
  if (isError) {
    return null;
  }
  return (
    <FlatList
      scrollEnabled={data && data?.length !== 0}
      data={data}
      renderItem={renderTaskItem}
      keyExtractor={(item) => `${item.id}`}
      ListHeaderComponent={Title}
      ListFooterComponent={AddTask}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
      }
      listKey={`${caseItem.title}`}
    />
  );
};

const styles = EStyleSheet.create({
  caseTitle: {
    color: 'white',
    fontFamily: '$boldFont',
    fontSize: 22,
    paddingHorizontal: 10,
  },
  addTask: {
    color: 'white',
    fontFamily: '$boldFont',
    fontSize: 16,
  },
});
export default TaskList;
