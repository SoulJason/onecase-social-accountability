import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';

import { StackParamList } from '../navigation/SignInStack';
import { StackNavigationProp } from '@react-navigation/stack';
import { Notification, NotificationType } from '../types';
import EStyleSheet from 'react-native-extended-stylesheet';
import useNotifications from '../queries/useNotifications';
import { RouteProp } from '@react-navigation/native';
import AssignTaskItem from '../components/AssignTaskItem';
import AddFriendItem from '../components/AddFriendItem';
import toCamelCase from '../utils/toCamelCase';
import groupBy from '../utils/groupBy';
import AddCouncilItem from '../components/AddCouncilItem';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Requests'>;
  route: RouteProp<StackParamList, 'Requests'>;
}

function RequestsScreen({ navigation, route }: Props) {
  const { data: notifications, isLoading, isError } = useNotifications();

  interface NotificationGroups {
    [type: string]: Notification[];
  }

  let notificationGroups: NotificationGroups = {};
  let requests: Notification[] = [];
  if (notifications) {
    notificationGroups = toCamelCase(
      groupBy(notifications, (notification) => notification.type)
    );
    Object.keys(notificationGroups).forEach((type: string) => {
      if (type === 'assignTask' || type === 'addFriend') {
        requests = requests.concat(notificationGroups[type]);
      }
    });
  }

  const renderRequestItem = ({ item }: { item: Notification }) => {
    switch (item.type) {
      case 'assign_task':
        return <AssignTaskItem request={item} />;
      case 'add_friend':
        return <AddFriendItem request={item} />;
      default: {
        return null;
      }
    }
  };

  if (isLoading) {
    return null;
  }
  if (isError) {
    return null;
  }
  return (
    <View>
      <FlatList
        style={{ height: '100%' }}
        data={requests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => `${item.id}`}
        // refreshControl={
        //   <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        // }
      />
    </View>
  );
}

const styles = EStyleSheet.create({});

export default RequestsScreen;
