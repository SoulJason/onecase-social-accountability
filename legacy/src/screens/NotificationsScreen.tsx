import React, { useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';

import { StackParamList } from '../navigation/SignInStack';
import { StackNavigationProp } from '@react-navigation/stack';
import { Notification } from '../types';
import EStyleSheet from 'react-native-extended-stylesheet';
import useNotifications from '../queries/useNotifications';
import groupBy from '../utils/groupBy';
import RequestsButton from '../components/RequestsButton';
import toCamelCase from '../utils/toCamelCase';
import NudgeNotification from '../components/NudgeNotification';
import CommentNotification from '../components/CommentNotification';
import aggregateAndCount from '../utils/aggregateAndCount';
import AddCouncilNotification from '../components/AddCouncilNotification';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Notifications'>;
}

function NotificationsScreen({ navigation }: Props) {
  // const [notifications, setNotification] = useState<Notification[]>([]);
  const {
    data: notifications,
    isLoading,
    isError,
    refetch,
  } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  interface NotificationGroups {
    [type: string]: Notification[];
  }

  let notificationGroups: NotificationGroups = {};
  let requests: Notification[] = [];
  let nonRequests: Notification[] = [];

  if (notifications) {
    notificationGroups = toCamelCase(
      groupBy(notifications, (notification) => notification.type)
    );
    Object.keys(notificationGroups).forEach((type: string) => {
      notificationGroups[type].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
    Object.keys(notificationGroups).forEach((type: string) => {
      if (type === 'assignTask' || type === 'addFriend') {
        requests = requests.concat(notificationGroups[type]);
      } else {
        if (type === 'nudge') {
          nonRequests = nonRequests.concat(
            aggregateAndCount(
              notificationGroups[type],
              ['taskId', 'senderId'],
              'id'
            )
          );
        } else {
          nonRequests = nonRequests.concat(notificationGroups[type]);
        }
      }
    });
  }

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    switch (item.type) {
      case 'nudge':
        return <NudgeNotification request={item} />;
      case 'comment':
        return <CommentNotification request={item} />;
      case 'add_council':
        return <AddCouncilNotification request={item} />;
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
      {requests.length !== 0 ? (
        <RequestsButton
          numRequests={requests.length}
          onPress={() => navigation.navigate('Requests')}
        />
      ) : null}
      <FlatList
        style={{ height: '100%' }}
        data={nonRequests}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => `${item.id}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      />
    </View>
  );
}

const styles = EStyleSheet.create({});

export default NotificationsScreen;
