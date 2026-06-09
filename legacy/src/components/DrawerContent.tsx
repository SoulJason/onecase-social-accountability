import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useUser } from '../providers/UserContext';
import { signOut } from '../lib/supabase/store';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { Avatar, Drawer, Title, Caption } from 'react-native-paper';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import IconButton from './IconButton';
import useCurrentUser from '../queries/useCurrentUser';
const DrawerContent = (props: any) => {
  const { navigation } = props;
  const { data: user } = useCurrentUser();

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        {/* <DrawerItemList {...props} /> */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingLeft: 20, marginTop: 15 }}>
            <Avatar.Image source={{ uri: user?.avatarUrl }} />
            <Title>
              {user?.firstName} {user?.lastName}
            </Title>
            <Caption>@{user?.username}</Caption>
          </View>
          <View>
            <DrawerItem
              icon={({ color, size }) => (
                <Ionicons
                  name='person-circle-outline'
                  size={size}
                  color={color}
                  style={{ marginRight: 5 }}
                />
              )}
              label='Profile'
              onPress={() => navigation.navigate('Profile')}
            />
            <DrawerItem
              icon={({ color, size }) => (
                <FontAwesome5 name='user-friends' size={size} color={color} />
              )}
              label='Friends'
              onPress={() => navigation.navigate('Friends')}
            />
          </View>
          <View
            style={{ marginTop: 200, backgroundColor: '#585858', padding: 20 }}
          >
            <Text style={{ color: 'white' }}>
              Need Accountability Partners?
            </Text>
            <IconButton
              icon={
                <Ionicons name='person-add-sharp' size={24} color='white' />
              }
              onPress={() => navigation.navigate('AddFriends')}
            >
              Add Friends
            </IconButton>
          </View>
        </View>
      </DrawerContentScrollView>
      <Drawer.Section>
        <DrawerItem label='Sign Out' onPress={signOut} />
      </Drawer.Section>
    </View>
  );
};

export default DrawerContent;
