import React from 'react';
import Constants from 'expo-constants';
import {
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import { useHeaderHeight } from '@react-navigation/stack';
import DismissKeyboardView from './DismissKeyboardView';

interface Props {
  children: React.ReactNode;
}
function CreateProfileTemplate({ children }: Props) {
  const headerHeight = useHeaderHeight();

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={headerHeight}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Pressable style={styles.main} onPress={Keyboard.dismiss}>
        {children}
      </Pressable>
    </KeyboardAvoidingView>
    // <DismissKeyboardView
    //   // keyboardVerticalOffset={headerHeight + Constants.statusBarHeight}
    //   // behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    //   style={styles.container}
    // >
    //   {children}
    // </DismissKeyboardView>
  );
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 30,
  },
  main: {
    flex: 1,
  },
});

export default CreateProfileTemplate;
