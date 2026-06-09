import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  FlatList,
  Pressable,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UserItem from '../components/UserItem';
// import SearchBar from 'react-native-dynamic-search-bar';
import EStyleSheet from 'react-native-extended-stylesheet';

function AssignCouncilScreen() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true); // or some other action
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false); // or some other action
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const updateSearch = (search: string) => {
    setSearch(search);
  };

  const selectUserItem = (id: string) => {
    const userList = [...users];
    const updatedUserList = userList.map((user: User) =>
      user.id === id ? { ...user, selected: !user.selected } : user
    );
    setUsers(updatedUserList);
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const backgroundColor = item.selected ? '#3D3D3D' : '#5F605F';
    return (
      <UserItem
        item={item}
        onPress={() => selectUserItem(item.id)}
        backgroundColor={{ backgroundColor }}
      />
    );
  };

  const selectedUsers = users.filter((user: User) => user.selected);

  const styles = EStyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      color: 'black',
      fontSize: '$heading',
      fontFamily: '$boldFont',
      textAlign: 'center',
    },
    searchBar: {
      marginTop: 20,
      elevation: 10,
    },
    scrollView: {
      flex: 1,
      marginBottom: 20,
    },
    list: {
      marginTop: 40,
    },
    separator: {
      height: 1,
      backgroundColor: '#FFFCF7',
    },
    bottomBar: {
      flex: 0,
      flexDirection: 'row',
      paddingHorizontal: 15,
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '$blueberry',
      width: '100%',
      height: isKeyboardVisible ? 50 : 80,
      paddingBottom: isKeyboardVisible ? 10 : 30,
    },
    selectedUsers: {
      color: 'white',
      fontSize: '$body',
      fontFamily: '$boldFont',
    },
  });

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <Pressable onPress={Keyboard.dismiss}>
          <Text style={styles.title}>Accountability Council</Text>
          {/* <SearchBar
            placeholder='Search for friends'
            // onPress={() => alert('onPress')}
            // onChangeText={(text) => console.log(text)}
            onChangeText={updateSearch}
            // value={search}-
            style={styles.searchBar}
          /> */}
          <SafeAreaView style={styles.scrollView}>
            <FlatList
              data={users}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              style={styles.list}
              contentContainerStyle={{ borderRadius: 10, overflow: 'hidden' }}
              getItemLayout={(data, index) => ({
                length: 50,
                offset: 50 * index,
                index,
              })}
              keyboardShouldPersistTaps='always'
            />
          </SafeAreaView>
          {selectedUsers.length == 0 && (
            <View style={{ height: isKeyboardVisible ? 0 : 80 }} />
          )}
        </Pressable>
      </View>
      {selectedUsers.length > 0 && (
        <View style={styles.bottomBar}>
          <View style={{ flex: 7 }}>
            <Text style={styles.selectedUsers} numberOfLines={1}>
              {selectedUsers.map((user: User) => user.username).join(', ')}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Ionicons name='checkmark-circle-outline' size={48} color='white' />
            <Ionicons
              name='checkmark-circle'
              color='#554B4B'
              style={{
                top: 0,
                left: 0,
                position: 'absolute',
              }}
              size={48}
            />
          </View>
        </View>
      )}
    </View>
  );
}

export default AssignCouncilScreen;
