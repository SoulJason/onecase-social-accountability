import React, { useState, useEffect, useContext } from 'react';
import {
  Text,
  View,
  FlatList,
  Pressable,
  Keyboard,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UserItem from '../components/UserItem';
// import SearchBar from 'react-native-dynamic-search-bar';
import EStyleSheet from 'react-native-extended-stylesheet';

import { sendPushNotification } from '../lib/supabase/store';
import { User } from '../types';
import TabColors from '../constants/TabColors';

import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp, useHeaderHeight } from '@react-navigation/stack';
import { StackParamList } from '../navigation/SignInStack';
import useAddCase from '../mutations/useAddCase';
import { PostgrestError } from '@supabase/supabase-js';
import { useQueryClient } from 'react-query';
import useFriends from '../queries/useFriends';
import Toast from 'react-native-toast-message';
import { useUser } from '../providers/UserContext';
import emojiRegex from 'emoji-regex';
import TextInput from '../components/TextInput';
import ShadowStyle from '../constants/ShadowStyle';
import useKeyboard from '../hooks/useKeyboard';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useMixpanel } from '../providers/MixpanelContext';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'CreateCase'>;
  route: RouteProp<StackParamList, 'CreateCase'>;
}

function CreateCaseScreen({ navigation, route }: Props) {
  const { index } = route.params;

  const [title, setTitle] = useState('');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [emoji, setEmoji] = useState('');

  const isKeyboardVisible = useKeyboard();

  const selectedUsers = users.filter((user: User) => user.selected);

  const { data: friends, isSuccess } = useFriends();

  const queryClient = useQueryClient();
  const addCaseMutation = useAddCase();
  const headerHeight = useHeaderHeight();
  const mixpanel = useMixpanel();

  useEffect(() => {
    if (isSuccess && friends) {
      const friendList = friends?.map((friend: User) => {
        friend.selected = false;
        return friend;
      });
      setUsers(friendList);
    }
  }, [isSuccess]);

  const createTask = async () => {
    let isValid = true;
    if (title === '') {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'No title entered',
        text2: 'Enter a title!',
        topOffset: 50,
      });
      isValid = false;
    } else if (emoji === '') {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'No emoji selected',
        text2: 'Select an emoji!',
        topOffset: 50,
      });
      isValid = false;
    }
    if (!isValid) {
      return;
    }
    const ids = selectedUsers.map((user) => user.id);
    await addCaseMutation.mutateAsync(
      { index, title, emoji, color: TabColors[index], users: ids },
      {
        onSuccess: async (data) => {
          queryClient.invalidateQueries('cases');
          if (data && data.length > 0) {
            mixpanel?.track('Created case', {
              'Case ID': data[0].id,
              'Current Number of Council Members': ids.length,
            });
            for (let user of selectedUsers) {
              await sendPushNotification(
                user.pushToken ?? '',
                user.id,
                'add_council',
                'Invited to Council',
                `${user.firstName} has invited you to their council for ${title}.`,
                null,
                data[0].id
              );
            }
          }
          navigation.goBack();
        },
        onError: (error) => {
          const errorMessage = (error as PostgrestError).message;
          if (errorMessage.includes('title')) {
            Alert.alert('That case title is already being used!');
          } else if (errorMessage.includes('emoji')) {
            Alert.alert('That case emoji is already being used!');
          } else if (errorMessage.includes('color')) {
            Alert.alert(
              'Looks like you ran into an issue! Try restarting your app.'
            );
          }
        },
      }
    );

    // if (!result.error) {
    //   navigation.goBack(); // TODO: or navigate directly to CreateTask?
    // } else {
    //   if (result.data.includes('title')) {
    //     Alert.alert('That case title is already being used!');
    //   } else if (result.data.includes('emoji')) {
    //     Alert.alert('That case emoji is already being used!');
    //   }
    // }
  };

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

  const styles = EStyleSheet.create({
    container: {
      flex: 1,
      // justifyContent: 'center',
      // alignItems: 'center',
    },
    title: {
      color: 'black',
      fontSize: '$heading',
      fontFamily: '$boldFont',
      textAlign: 'center',
    },
    case: {
      color: '$blueberry',
    },
    caseInput: {
      // justifyCone
      borderRadius: 15,
      backgroundColor: 'white',
      paddingHorizontal: 10,
      paddingVertical: 3,
      // borderWidth: 1,
      // borderColor: '#C4C4C4',
      fontFamily: '$normalFont',
      fontSize: 13,
      width: '80%',
      elevation: 10,
    },
    searchBar: {
      marginTop: 20,
      elevation: 10,
    },
    emojiButton: {
      width: 64,
      height: 64,
      backgroundColor: 'white',
      elevation: 10,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      fontSize: 32,
      marginTop: 5,
    },
    emoji: {
      fontSize: 32,
    },
    scrollView: {
      marginHorizontal: 25,
      marginBottom: 20,
    },
    list: {
      ...ShadowStyle,
      marginTop: 40,
    },
    separator: {
      height: 1,
      backgroundColor: '#FFFCF7',
    },
    bottomBarContainer: {
      backgroundColor: '$blueberry',
    },
    bottomBar: {
      flexDirection: 'row',
      paddingHorizontal: 15,
      paddingTop: 10,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: isKeyboardVisible ? 80 : 80,
      paddingBottom: isKeyboardVisible ? 20 : 10,
    },
    selectedUsers: {
      color: 'white',
      fontSize: '$body',
      fontFamily: '$boldFont',
    },
  });

  const handleEmojiSelect = (text: string) => {
    const regex = emojiRegex();
    const emojiText = text.match(regex);
    console.log('EMJI', emojiText, emojiText?.length);
    if (emojiText && emojiText.length == 2) {
      setEmoji(emojiText[1]);
    } else if (emojiText === null || emojiText.length < 1) {
      console.log('yo?');
      setEmoji('');
    } else if (emojiText && emojiText.length === 1) {
      console.log('bruh', emojiText.slice(0, 1));
      setEmoji(emojiText.slice(0, 1)[0]);
    }
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={{ flex: 1 }}>
          <Pressable
            onPress={() => {
              Keyboard.dismiss();
            }}
          >
            <Text style={styles.title}>
              New <Text style={styles.case}>Case</Text> Title
            </Text>
            <View
              style={{ alignItems: 'center', marginTop: 10, marginBottom: 30 }}
            >
              <TextInput
                placeholder='Swimming, Homework, etc.'
                value={title}
                onChangeText={(text) => setTitle(text)}
                style={{ width: '80%' }}
              />
            </View>

            {/* <SearchBar
            placeholder='Search for friends'
            // onPress={() => alert('onPress')}
            // onChangeText={(text) => console.log(text)}
            onChangeText={updateSearch}
            // value={search}-
            style={styles.searchBar}
          /> */}
            <SafeAreaView
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Text>Select an emoji for it!</Text>
              <TextInput
                style={styles.emojiButton}
                value={emoji}
                onChangeText={handleEmojiSelect}
                autoCompleteType='off'
                caretHidden={true}
                selectTextOnFocus={false}
                underlineColorAndroid='transparent'
              />
            </SafeAreaView>
            {true ? (
              <>
                <Text style={styles.title}>Accountability Council</Text>
                <SafeAreaView style={styles.scrollView}>
                  <FlatList
                    data={users}
                    renderItem={renderUserItem}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={() => (
                      <View style={styles.separator} />
                    )}
                    style={styles.list}
                    contentContainerStyle={{
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}
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
              </>
            ) : null}
          </Pressable>
        </View>
      </ScrollView>
      {title !== '' && emoji !== '' ? (
        <KeyboardAvoidingView
          style={styles.bottomBarContainer}
          behavior={Platform.select({ android: undefined, ios: 'padding' })}
          keyboardVerticalOffset={Platform.select({
            ios: headerHeight,
          })}
        >
          <View style={styles.bottomBar}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={styles.selectedUsers} numberOfLines={1}>
                {selectedUsers.length > 0
                  ? selectedUsers.map((user: User) => user.username).join(', ')
                  : null}
              </Text>
            </View>
            <Pressable onPress={createTask}>
              <View style={{ flex: 1 }}>
                <Ionicons
                  name='checkmark-circle-outline'
                  size={48}
                  color='white'
                />
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
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      ) : null}
    </>
  );
}

export default CreateCaseScreen;
