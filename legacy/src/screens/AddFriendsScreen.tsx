import React, { useState, useEffect } from 'react';
import { FlatList, View, Text, Linking, Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { searchUser } from '../lib/supabase/store';
import { Contact, Notification, User } from '../types';
import UserItem from '../components/UserItem';
import FriendItem from '../components/FriendItem';
import useSearchUsers from '../queries/useSearchUsers';
import useAddUserRelationship from '../mutations/useAddUserRelationship';
import TextInput from '../components/TextInput';
import IconButton from '../components/IconButton';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../providers/UserContext';
import useFriendRequests from '../queries/useFriendRequests';
import DismissKeyboardView from '../components/DismissKeyboardView';
import AddFriendItem from '../components/AddFriendItem';

import * as Contacts from 'expo-contacts';
import ContactItem from '../components/ContactItem';

function AddFriendsScreen() {
  const [query, setQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  // const [users, setUsers] = useState<User[]>([]);
  const { data: users } = useSearchUsers(query);
  const { data: friendRequests } = useFriendRequests();
  const { user } = useUser();

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data: contactsData } = await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.FirstName,
            Contacts.Fields.PhoneNumbers,
            Contacts.Fields.Image,
          ],
        });
        let contactList: Contact[] = [];
        console.log(contactsData);
        contactsData.forEach((contact) => {
          if (
            contact.contactType === 'person' &&
            contact.firstName &&
            contact.phoneNumbers &&
            contact.phoneNumbers.length > 0 &&
            contact.phoneNumbers[0].number
          ) {
            let digits;
            if (contact.phoneNumbers[0].digits) {
              digits = contact.phoneNumbers[0].digits;
            } else {
              digits = contact.phoneNumbers[0].number.replace(/\D/g, '');
            }
            contactList.push({
              id: contact.id,
              name: contact.firstName,
              phoneNumber: contact.phoneNumbers[0].number,
              phoneNumberDigits: digits,
            });
          }
        });
        setContacts(contactList);
      } else {
        console.log('Not granted');
      }
    })();
  }, []);

  const handleChange = async (text: string) => {
    setQuery(text);
  };

  const renderUserItem = ({ item }: { item: User }) => {
    return (
      <View>
        <FriendItem item={item} actionButton noPressHighlight />
      </View>
    );
  };

  const Subtitle = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.subtitleContainer}>
      <Text style={styles.subtitleText}>{children}</Text>
    </View>
  );

  const renderFriendRequestItem = ({ item }: { item: Notification }) => {
    return <AddFriendItem request={item} listItem={true} />;
  };

  const renderContactItem = ({ item }: { item: Contact }) => {
    return <ContactItem contact={item} />;
  };

  return (
    <View style={styles.container}>
      <DismissKeyboardView
        style={{ alignItems: 'center', marginTop: 10, marginBottom: 20 }}
        pressableStyle={{ flex: 0 }}
      >
        <TextInput
          placeholder='Find Friends'
          autoCapitalize='none'
          onChangeText={handleChange}
        />
      </DismissKeyboardView>
      {query === '' ? (
        <>
          {friendRequests && friendRequests.length > 0 ? (
            <View style={{ flex: 2 }}>
              <DismissKeyboardView
                pressableStyle={{ flex: 0, marginBottom: 10 }}
              >
                <Subtitle>Added Me</Subtitle>
              </DismissKeyboardView>
              <FlatList
                style={{ height: '100%' }}
                data={friendRequests}
                renderItem={renderFriendRequestItem}
                keyExtractor={(item) => `${item.id}`}
              />
            </View>
          ) : null}
          {contacts && contacts.length > 0 ? (
            <View style={{ flex: 3 }}>
              <DismissKeyboardView
                style={{ marginBottom: 10 }}
                pressableStyle={{ flex: 0 }}
              >
                <Subtitle>Invite to OneCase</Subtitle>
              </DismissKeyboardView>
              <FlatList
                style={{ height: '100%' }}
                data={contacts}
                renderItem={renderContactItem}
              />
            </View>
          ) : null}
        </>
      ) : (
        <FlatList data={users} renderItem={renderUserItem} />
      )}
    </View>
  );
}
const styles = EStyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 15,
  },
  subtitleContainer: {
    backgroundColor: '#535353',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  subtitleText: {
    fontFamily: '$boldFont',
    fontSize: 16,
    color: '#FFF',
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
  searchBar: {
    marginTop: 20,
    elevation: 10,
  },
});

export default AddFriendsScreen;
