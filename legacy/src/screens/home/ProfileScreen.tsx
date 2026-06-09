import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

import { Title, Caption } from 'react-native-paper';
import Button from '../../components/Button';
import CaseUpdateList from '../../components/CaseUpdateList';
import { StackParamList } from '../../navigation/SignInStack';

import useCurrentUser from '../../queries/useCurrentUser';
import useCaseUpdates from '../../queries/useCaseUpdates';
import { CaseUpdate } from '../../types';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useNavigation } from '@react-navigation/native';
import { Avatar } from 'react-native-elements';

function ProfileScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const { data: user } = useCurrentUser();
  const { data, refetch } = useCaseUpdates();

  const refresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={{ flex: 1, height: '100%', marginTop: 10 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
      }
    >
      <View style={{ flexDirection: 'column' }}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, paddingLeft: 20, marginTop: 15 }}>
            {user?.avatarUrl ? (
              <Avatar
                size='large'
                rounded
                source={{ uri: user?.avatarUrl }}
                icon={{
                  name: 'user-circle',
                  type: 'font-awesome',
                  color: 'black',
                }}
              />
            ) : (
              <Avatar
                size='large'
                rounded
                icon={{
                  name: 'user-circle',
                  type: 'font-awesome',
                  color: 'black',
                }}
              />
            )}

            <Title style={styles.name}>
              {user?.firstName} {user?.lastName}
            </Title>
            <Caption style={styles.username}>@{user?.username}</Caption>
          </View>
          <View
            style={{
              flex: 1,
              marginHorizontal: 30,
              justifyContent: 'flex-end',
            }}
          >
            <Button
              type='light'
              style={{
                elevation: 0,
                borderWidth: 1,
                paddingVertical: 1,
                borderRadius: 6,
              }}
              textStyle={{
                fontSize: 16,
              }}
              onPress={() => navigation.navigate('EditProfile')}
            >
              Edit Profile
            </Button>
          </View>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '90%', paddingBottom: 25 }}>
            <CaseUpdateList
              caseUpdates={data as CaseUpdate[]}
              isPublic={false}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = EStyleSheet.create({
  name: {
    fontSize: 22,
    fontFamily: '$boldFont',
  },
  username: {
    fontSize: 15,
    fontFamily: '$normalFont',
  },
});

export default ProfileScreen;
