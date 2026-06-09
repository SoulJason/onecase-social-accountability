import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, Animated } from 'react-native';
import { Avatar } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';
import { FontAwesome5 } from '@expo/vector-icons';
import Collapsible from 'react-native-collapsible';
import AvatarRow from '../AvatarRow';
import { Task, Case, User } from '../../types';
import { fetchTasks } from '../../lib/supabase/store';

interface Props {
  caseItem: Case;
  navigation: any;
  refreshing: boolean;
  onFinishRefresh: () => void;
}

const users = [
  {
    name: 'Lawrence Lin',
    profilePicture: 'https://uifaces.co/our-content/donated/fyXUlj0e.jpg',
  },
  {
    name: 'James Bayley',
    profilePicture: 'https://randomuser.me/api/portraits/men/85.jpg',
    selected: false,
  },
  {
    name: 'Emperor Palpatine',
    profilePicture: 'https://randomuser.me/api/portraits/men/86.jpg',
    selected: false,
  },
  // {
  //   name: 'Darth Vader',
  //   profilePicture: 'https://randomuser.me/api/portraits/men/88.jpg',
  //   selected: false,
  // },
  // {
  //   name: 'Thrawn',
  //   profilePicture: 'https://randomuser.me/api/portraits/men/87.jpg',
  //   selected: false,
  // },
  // {
  //   name: 'John Wick',
  //   profilePicture: 'https://randomuser.me/api/portraits/men/90.jpg',
  //   selected: false,
  // },
];

const CaseItem = ({
  caseItem,
  navigation,
  refreshing,
  onFinishRefresh,
}: Props) => {
  const users = caseItem.usersCases?.map((user) => user.users);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [expanded, setExpanded] = useState(true);

  async function loadTasks() {
    const data = await fetchTasks(caseItem.id);
    setTasks(data as Task[]);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (refreshing) {
      loadTasks();
      onFinishRefresh();
    }
  }, [refreshing]);

  const renderTaskItem = ({ item }: { item: Task }) => {
    return (
      <View style={styles.taskButton}>
        <Pressable
          style={styles.task}
          onPress={() => navigation.navigate('Task', { task: item, users })}
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
              council: caseItem.council,
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

  const councilUsers = users?.slice(0, 5);
  const firstTwoTasks = tasks.slice(0, 2);
  const restTasks = tasks.slice(2);

  return (
    <View style={styles.card}>
      <View
        style={{
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(102, 102, 102, 0.34)',
          paddingLeft: 5,
        }}
      >
        <Text style={styles.title}>{caseItem.title}</Text>

        <AvatarRow
          users={councilUsers as User[]}
          placement={-15 * (councilUsers as User[]).length}
        />
      </View>
      <Text style={styles.description}>{caseItem.description}</Text>
      <FlatList
        data={firstTwoTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => `${item.id}`}
        listKey={`${caseItem.title}-first-two-tasks`}
      />

      <Collapsible collapsed={expanded}>
        <FlatList
          data={restTasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => `${item.id}`}
          listKey={`${caseItem.title}-rest-tasks`}
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
    flex: 1,
    fontFamily: '$boldFont',
    fontSize: '$heading',
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

export default CaseItem;
