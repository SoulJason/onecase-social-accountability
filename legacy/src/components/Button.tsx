import React from 'react';
import { Text, Pressable } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import ShadowStyle from '../constants/ShadowStyle';

interface Props {
  type?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark'
    | 'action';
  disabled?: boolean;
  style?: {
    [x: string]: any;
  };
  textStyle?: {
    [x: string]: any;
  };
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  [x: string]: any;
}
const Button = ({
  type,
  disabled,
  children,
  style: styleProp,
  textStyle,
  rightIcon,
  ...props
}: Props) => {
  const style = [styles.button, styleProp, type && styles[type]];

  return (
    <Pressable
      style={({ pressed }) => [
        style,
        {
          opacity: pressed ? 0.6 : 1.0,
        },
        disabled && styles.disabled,
      ]}
      disabled={disabled}
      {...props}
    >
      <Text
        style={[styles.text, type === 'light' && styles.lightText, textStyle]}
      >
        {children}
      </Text>
      {rightIcon}
    </Pressable>
  );
};
const styles = EStyleSheet.create({
  button: {
    backgroundColor: '#000000',
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderRadius: 30,
    marginHorizontal: 15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    ...ShadowStyle,
  },
  text: {
    fontSize: '$heading',
    fontFamily: '$boldFont',
    color: '#FFFFFF',
  },
  disabled: {
    backgroundColor: '#A19E9E',
  },
  primary: {
    backgroundColor: '#43A4EB',
  },
  secondary: {
    backgroundColor: '#9A9A9A',
  },
  success: {
    backgroundColor: '$grannySmithApple',
  },
  danger: {
    backgroundColor: '#E56E6E',
  },
  warning: {},
  info: {
    backgroundColor: '#7189FF',
  },
  light: {
    backgroundColor: '#FFFFFF',
  },
  dark: {},
  action: {
    backgroundColor: '#758ECD',
  },
  lightText: {
    color: '#000000',
  },
});

export default Button;
