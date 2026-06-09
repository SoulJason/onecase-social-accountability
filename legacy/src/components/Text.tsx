import React from 'react';
import { Text as NativeText } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

const styles = EStyleSheet.create({
  text: {
    color: '$textPrimary',
    fontSize: '$body',
    fontFamily: '$normalFont',
  },
});

interface Props {
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  style?: any;
  children: any;
}
const Text = ({ color, fontSize, fontWeight, style, ...props }: Props) => {
  const textStyle = [styles.text];

  return <NativeText style={textStyle} {...props} />;
};

export default Text;
