import React from 'react';
import { View, Text, Pressable, Linking, Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Contact, Notification, User } from '../types';
import useAddUserRelationship from '../mutations/useAddUserRelationship';
import { useUser } from '../providers/UserContext';
import RequestItem from './RequestItem';
import useUserProfile from '../queries/useUserProfile';
import useDeleteNotification from '../mutations/useDeleteNotification';
import { Avatar } from 'react-native-elements';
import IconButton from './IconButton';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  contact: Contact;
}

function openSmsUrl(phone: string, body: string): Promise<any> {
  return openUrl(`sms:${phone}${getSMSDivider()}body=${body}`);
}
function openUrl(url: string): Promise<any> {
  return Linking.openURL(url);
}
function getSMSDivider(): string {
  return Platform.OS === 'ios' ? '&' : '?';
}

const ContactItem = ({ contact }: Props) => {
  const { name, phoneNumber } = contact;
  const { user } = useUser();

  const handleSendInvite = async () => {
    const body = `Hey, can you be my accountability partner on this app OneCase? My username is ${user?.username}. Here’s the download link: https://onecase.app/`;
    await openSmsUrl(contact.phoneNumberDigits, body);
  };

  return (
    <View style={styles.item}>
      <View style={styles.userInfo}>
        <Avatar
          size='medium'
          rounded
          icon={{
            name: 'user-circle',
            type: 'font-awesome',
            color: 'black',
          }}
          activeOpacity={0.7}
        ></Avatar>
        <View style={styles.text}>
          <Text style={styles.nameText}>{name}</Text>
          <Text style={styles.usernameText}>{phoneNumber}</Text>
          <Text style={styles.usernameText}>Invite To OneCase</Text>
        </View>
      </View>
      <View>
        <IconButton
          type='primary'
          icon={<Ionicons name='ios-send-outline' size={24} color='white' />}
          onPress={handleSendInvite}
        >
          Send Invite
        </IconButton>
      </View>
    </View>
  );
};

const styles = EStyleSheet.create({
  item: {
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E5E5E5',
    borderBottomWidth: 1,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    padding: 5,
  },
  text: {
    marginLeft: 10,
  },
  nameText: {
    color: '#323232',
    fontFamily: '$boldFont',
  },
  usernameText: {
    color: '#9E9E9E',
  },
});

export default ContactItem;
