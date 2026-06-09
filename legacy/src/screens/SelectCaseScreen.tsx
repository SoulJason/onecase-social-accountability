import React, { useState, useEffect } from 'react';
import { View, Pressable, Text } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { fetchCases } from '../lib/supabase/store';
import { Case } from '../types';

import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParamList } from '../navigation/SignInStack';
import useCases from '../queries/useCases';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'SelectCase'>;
  route: RouteProp<StackParamList, 'SelectCase'>;
}

interface UndecidedCase {
  id: number;
  title: 'Undecided';
  emoji: '💡';
  color: '#4C4D4C';
}

function SelectCaseScreen({ navigation }: Props) {
  const { data } = useCases();
  if (!data) {
    return null;
  }
  let cases: Array<Case | UndecidedCase> = [...data];

  const usedIds = cases.map((data: Case | UndecidedCase) => data.id);
  while (cases.length < 4) {
    let id = cases.length - 1;
    while (usedIds.includes(id)) {
      id += 1;
    }
    usedIds.push(id);
    cases.push({
      id,
      title: 'Undecided',
      emoji: '💡',
      color: '#4C4D4C',
    });
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', marginBottom: 100 }}>
      {cases.map((caseItem: Case | UndecidedCase, index: number) => (
        <Pressable
          key={caseItem.id}
          style={[styles.button, { backgroundColor: caseItem.color }]}
          onPress={() => {
            if (caseItem.title !== 'Undecided') {
              navigation.navigate('CreateTask', { caseItem: caseItem as Case });
            } else {
              navigation.navigate('CreateCase', { index });
            }
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
export default SelectCaseScreen;
