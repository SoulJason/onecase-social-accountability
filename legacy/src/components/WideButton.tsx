import React from 'react';
import { Text, Pressable } from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

interface Props {
  type?: 'success' | 'danger';
  style?: {
    [x: string]: any;
  };
  children: React.ReactNode;
  [x: string]: any;
}
const WideButton = ({ type, children, style: styleProp, ...props }: Props) => {
  const style = [
    styles.clockButton,
    styleProp,
    type === 'success' && styles.success,
    type === 'danger' && styles.danger,
  ];

  return (
    <Pressable style={style} {...props}>
      <Text style={styles.clockText}>{children}</Text>
    </Pressable>
  );
};
const styles = EStyleSheet.create({
  clockButton: {
    backgroundColor: '#000000',
    padding: 10,
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 15,
    elevation: 10,
    width: '100%',
  },
  clockText: {
    fontSize: '$heading',
    fontFamily: '$boldFont',
    color: '#FFFFFF',
  },
  success: {
    backgroundColor: '$grannySmithApple',
  },
  danger: {
    backgroundColor: '#E56E6E',
  },
});

export default WideButton;
