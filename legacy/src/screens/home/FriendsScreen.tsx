import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import FriendItem from '../../components/FriendItem';
import EStyleSheet from 'react-native-extended-stylesheet';
import useFriends from '../../queries/useFriends';
import { User } from '../../types';
import { BottomTabParamList } from '../../navigation/HomeTabScreen';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import IconButton from '../../components/IconButton';
import DismissKeyboardView from '../../components/DismissKeyboardView';
import TextInput from '../../components/TextInput';

interface Props {
  navigation: BottomTabNavigationProp<BottomTabParamList, 'Friends'>;
}

function FriendsScreen({ navigation }: Props) {
  const { data, isFetching, isLoading, isError, refetch } = useFriends();
  const [refreshing, setRefreshing] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);

  useEffect(() => {
    if (!isFetching) {
      setFriends(data as User[]);
    }
  }, [isFetching]);

  const refresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  console.log('USERS', friends);

  const renderUserItem = ({ item }: { item: User }) => {
    return (
      <View>
        <FriendItem
          item={item}
          onPress={() => {
            console.log('pressing on', item.firstName, item.id);
            navigation.navigate('UserProfile', { userId: item.id });
          }}
        />
      </View>
    );
  };

  const handleSearch = (text: string) => {
    if (data) {
      const sub = text.toLowerCase();
      const filteredFriends = data.filter((friend) =>
        friend.username
          .toLowerCase()
          .startsWith(sub.slice(0, Math.max(friend.username.length - 1, 1)))
      );
      setFriends(filteredFriends);
    }
  };

  const AddFriends = () => {
    return (
      <View style={styles.addFriends}>
        <Text style={styles.heading}>Need Accountability Partners?</Text>
        <Text style={styles.subheading}>
          Tell your friends to download the app
        </Text>
        <IconButton
          style={{ marginTop: 10 }}
          icon={<Ionicons name='person-add-sharp' size={24} color='white' />}
          textStyle={{ fontSize: 18 }}
          onPress={() => {
            navigation.navigate('AddFriends');
          }}
        >
          Add Friends
        </IconButton>
      </View>
    );
  };
  if (isLoading) {
    return null;
  }
  if (isError) {
    return null;
  }
  return (
    <DismissKeyboardView>
      <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 30 }}>
        <TextInput
          placeholder='Search Friends'
          autoCapitalize='none'
          onChangeText={handleSearch}
          style={{ width: '80%' }}
        />
      </View>
      <FlatList
        style={{ height: '100%' }}
        data={friends}
        renderItem={renderUserItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        ListFooterComponent={AddFriends}
      />
    </DismissKeyboardView>
  );
}

const styles = EStyleSheet.create({
  addFriends: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  heading: {
    fontFamily: '$semiboldFont',
    fontSize: 18,
  },
  subheading: {
    fontFamily: '$normalFont',
    fontSize: 15,
    marginTop: 5,
  },
});

export default FriendsScreen;
