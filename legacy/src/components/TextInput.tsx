import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput as Input,
  TextInputProps,
  TextStyle,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import ShadowStyle from '../constants/ShadowStyle';

interface Props {
  style?: TextStyle;
}
const TextInput = ({ style, ...props }: Props & TextInputProps) => {
  return (
    <Input
      style={[styles.input, style]}
      {...props}
      placeholderTextColor={style && style.color ? style.color : undefined}
    />
  );
};

const styles = EStyleSheet.create({
  input: {
    borderRadius: 15,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontFamily: '$normalFont',
    fontSize: 15,
    width: '100%',
    ...ShadowStyle,
  },
});

export default TextInput;
