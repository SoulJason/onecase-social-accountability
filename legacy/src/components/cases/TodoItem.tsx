import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { Avatar } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';
import { FontAwesome5 } from '@expo/vector-icons';
import Collapsible from 'react-native-collapsible';
import { Task } from '../../types';
import { fetchTodos } from '../../lib/supabase/store';

interface Props {
  navigation: any;
}

const TodoItem = ({ navigation }: Props) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      const data = await fetchTodos();
      setTasks(data as Task[]);
    }
    loadTasks();
  }, []);

  const renderTaskItem = ({ item }: { item: Task }) => {
    return (
      <View style={styles.taskButton}>
        <Pressable
          style={styles.task}
          onPress={() => navigation.navigate('Task', { task: item })}
        >
          <Text style={styles.taskText}>{item.title}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.clock,
            { opacity: pressed ? 0.4 : 1.0 },
          ]}
          onPress={() =>
            navigation.navigate('ClockIn', {
              task: item,
            })
          }
        >
          <Text>⏰</Text>
        </Pressable>
      </View>
    );
  };

  const expand = () => {
    setExpanded(!expanded);
  };

  let firstTwoTasks = tasks;
  let restTasks = tasks;

  if (tasks.length > 0) {
    firstTwoTasks = tasks.slice(0, 2);
    restTasks = tasks.slice(2);
  }

  return (
    <View style={styles.card}>
      <View
        style={{
          // flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(102, 102, 102, 0.34)',
          paddingLeft: 5,
          paddingBottom: 5,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#272635',
            alignSelf: 'flex-start',
            paddingHorizontal: 7,
            paddingVertical: 5,
            borderRadius: 10,
          }}
        >
          <Text style={styles.title}>To-Dos</Text>
        </View>
      </View>
      <Text style={styles.description}>
        Tasks you or your "friends" assigned you
      </Text>
      <FlatList
        data={firstTwoTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => `${item.id}`}
        listKey={`to-dos-first-two-tasks`}
      />

      <Collapsible collapsed={expanded}>
        <FlatList
          data={restTasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => `${item.id}`}
          listKey={`to-dos-rest-tasks`}
        />
      </Collapsible>

      <Pressable style={styles.dropdown} onPress={expand}>
        <FontAwesome5
          name={!expanded ? 'angle-double-up' : 'angle-double-down'}
          size={24}
          color='black'
        />
      </Pressable>
    </View>
  );
};

const styles = EStyleSheet.create({
  confirm: {
    marginRight: 10,
    color: '#747474',
    fontFamily: '$normalFont',
  },
  card: {
    elevation: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
  },
  title: {
    // flex: 1,
    fontFamily: '$boldFont',
    fontSize: '$heading',
    color: 'white',
  },
  description: {
    fontFamily: '$boldFont',
    fontSize: '$body',
    marginVertical: 5,
  },
  taskButton: {
    backgroundColor: '$ceruleanFrost',
    marginVertical: 5,
    borderRadius: 10,
    elevation: 10,
    flexDirection: 'row',
  },
  task: {
    flex: 1,
    padding: 10,
  },
  clock: {
    backgroundColor: '$grannySmithApple',
    height: '100%',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    padding: 10,
  },
  taskText: {
    fontFamily: '$boldFont',
    color: '#FFFFFF',
  },
  dropdown: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TodoItem;
