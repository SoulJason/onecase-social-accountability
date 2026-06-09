import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Animated,
  TextInput,
} from 'react-native';
import { Avatar } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';
import { FontAwesome5 } from '@expo/vector-icons';
import Collapsible from 'react-native-collapsible';
import AvatarRow from '../AvatarRow';
import CommentList from './CommentList';
import { User, Task, Case } from '../../types';

interface Props {
  caseItem: Case;
  navigation: any;
}

const users: User[] = [
  {
    id: '1',
    username: 'Lawrence Lin',
    avatarUrl: 'https://uifaces.co/our-content/donated/fyXUlj0e.jpg',
    email: 'l@email.com',
  },
  {
    id: '2',
    username: 'James Bayley',
    avatarUrl: 'https://randomuser.me/api/portraits/men/85.jpg',
    email: 'a@email.com',
  },
  {
    id: '3',
    username: 'Emperor Palpatine',
    avatarUrl: 'https://randomuser.me/api/portraits/men/86.jpg',
    email: 'w@email.com',
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

const CouncilCaseItem = ({ caseItem, navigation }: Props) => {
  const [expanded, setExpanded] = useState(true);
  const [minHeight, setMinHeight] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);
  const [animation] = useState(new Animated.Value(0));

  const expand = () => {
    setExpanded(!expanded);
  };

  const councilUsers = users.slice(0, 5);
  const firstTwoTasks = caseItem.tasks.slice(0, 2);
  const restTasks = caseItem.tasks.slice(2);

  return (
    <View style={styles.card}>
      <View
        style={{
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(102, 102, 102, 0.34)',
          paddingLeft: 5,
          justifyContent: 'center',
          // alignItems: 'center',
        }}
      >
        <Avatar
          size='small'
          rounded
          source={{ uri: 'https://randomuser.me/api/portraits/men/90.jpg' }}
          containerStyle={{ top: -5, right: 5 }}
        />
        <Text style={styles.title}>{caseItem.title}</Text>

        <AvatarRow users={councilUsers} placement={-15 * councilUsers.length} />
      </View>
      <Text style={styles.description}>{caseItem.description}</Text>
      <View style={{ marginHorizontal: 20, marginTop: 10 }}>
        <CommentList caseId={caseItem.id} />
      </View>

      <Collapsible collapsed={expanded}>{/* comments */}</Collapsible>

      <Pressable style={styles.dropdown} onPress={expand}>
        <FontAwesome5
          name={!expanded ? 'angle-double-up' : 'angle-double-down'}
          size={24}
          color='black'
        />
      </Pressable>
      <View style={{ flexDirection: 'row' }}>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Nudge</Text>
        </Pressable>
      </View>
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
    color: '$blueberry',
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
  button: {
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 6,
    backgroundColor: '$blueberry',
  },
  buttonText: {
    fontFamily: '$boldFont',
    fontSize: 13,
    color: 'white',
  },
});

export default CouncilCaseItem;
