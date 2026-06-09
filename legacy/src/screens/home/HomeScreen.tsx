import React from 'react';
import TabBar from '../../components/TabBar';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParamList } from '../../navigation/SignInStack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import TasksScreen from '../TasksScreen';
import CouncilScreen from '../CouncilScreen';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'HomeTab'>;
}

const Tab = createMaterialTopTabNavigator();

function HomeScreen({ navigation }: Props) {
  return (
    <>
      <Tab.Navigator
        tabBar={(props: any) => <TabBar {...props} />}
        swipeEnabled={false}
      >
        <Tab.Screen name='Tasks' component={TasksScreen} />
        <Tab.Screen name='Council' component={CouncilScreen} />
      </Tab.Navigator>
    </>
  );
}

export default HomeScreen;
