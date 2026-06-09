import React from 'react';
import { View, Pressable, Text } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Case } from '../types';

import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParamList } from '../navigation/SignInStack';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'AssignTaskSelectCase'>;
  route: RouteProp<StackParamList, 'AssignTaskSelectCase'>;
}

function AssignTaskSelectCaseScreen({ navigation, route }: Props) {
  const { assignee, cases } = route.params;

  return (
    <View style={{ flex: 1, justifyContent: 'center', marginBottom: 100 }}>
      {cases.map((caseItem: Case, index: number) => (
        <Pressable
          key={caseItem.id}
          style={[styles.button, { backgroundColor: caseItem.color }]}
          onPress={() => {
            navigation.navigate('AssignTask', {
              assignee: assignee,
              caseItem: caseItem as Case,
              cases,
            });
          }}
        >
          <Text style={styles.title}>{caseItem.title}</Text>
          <Text style={styles.emoji}>{caseItem.emoji}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = EStyleSheet.create({
  button: {
    marginVertical: 10,
    marginHorizontal: 20,
    padding: 10,
    borderRadius: 10,
    elevation: 10,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'open-sans-bold',
  },
  emoji: {
    textAlign: 'center',
    fontSize: 36,
  },
});
export default AssignTaskSelectCaseScreen;
