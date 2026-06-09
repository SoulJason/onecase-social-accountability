import React from 'react';
import { Text, Pressable } from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

interface Props {
  type?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark';
  style?: {
    [x: string]: any;
  };
  textStyle?: {
    [x: string]: any;
  };
  children: React.ReactNode;
  [x: string]: any;
}
const PressableText = ({
  type,
  children,
  style: styleProp,
  textStyle,
  ...props
}: Props) => {
  const style = [styles.text, styleProp, type && styles[type]];

  return (
    <Pressable
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.6 : 1.0,
        },
      ]}
      {...props}
    >
      <Text style={[style, textStyle]}>{children}</Text>
    </Pressable>
  );
};
const styles = EStyleSheet.create({
  text: {
    fontSize: '$body',
    fontFamily: '$normalFont',
    color: '#7189FF',
  },
  primary: {
    color: '#43A4EB',
  },
  secondary: {
    color: '#9A9A9A',
  },
  success: {
    color: '$grannySmithApple',
  },
  danger: {
    color: '#E56E6E',
  },
  warning: {},
  info: {},
  light: {},
  dark: {},
});

export default PressableText;
