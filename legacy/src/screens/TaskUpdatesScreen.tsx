import React from 'react';
import { View, Text } from 'react-native';

import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParamList } from '../navigation/SignInStack';
import UpdateList from '../components/updates/UpdateList';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'TaskUpdates'>;
  route: RouteProp<StackParamList, 'TaskUpdates'>;
}

function TaskUpdatesScreen({ route }: Props) {
  const { updates } = route.params;
  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>
        Updates
      </Text>
      <UpdateList updates={updates} />
    </View>
  );
}

export default TaskUpdatesScreen;
