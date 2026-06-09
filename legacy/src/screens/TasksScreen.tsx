import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView } from 'react-native';
import { Case } from '../types';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { fetchCases } from '../lib/supabase/store';
import CaseTabBar from '../components/categories/CaseTabBar';
import CaseTab from '../components/categories/CaseTab';
import useCases from '../queries/useCases';

const Tab = createMaterialTopTabNavigator();

function TasksScreen({ navigation }: any) {
  const { data: cases, isLoading } = useCases();

  if (isLoading || (cases && cases.length == 0)) {
    return null;
  }

  return (
    <Tab.Navigator
      tabBar={(props: any) => <CaseTabBar cases={cases} {...props} />}
    >
      {cases?.map((caseItem) => (
        <Tab.Screen
          key={caseItem.id}
          name={caseItem.title}
          children={(props) => <CaseTab {...props} caseItem={caseItem} />}
        />
      ))}
    </Tab.Navigator>
  );
}

export default TasksScreen;
