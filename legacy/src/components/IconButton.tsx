import React from 'react';
import { Text, Pressable, TextStyle, ViewStyle } from 'react-native';

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
  icon: React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  [x: string]: any;
}

const IconButton = ({
  type = 'primary',
  icon,
  children,
  style,
  textStyle,
  ...props
}: Props) => {
  const buttonStyle = [styles.button, type && styles[type], style];

  return (
    <Pressable
      style={({ pressed }) => [buttonStyle, { opacity: pressed ? 0.4 : 1.0 }]}
      {...props}
    >
      {icon}
      <Text
        style={[styles.text, type === 'light' && styles.lightText, textStyle]}
      >
        {children}
      </Text>
    </Pressable>
  );
};

const styles = EStyleSheet.create({
  button: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    // marginTop: 10,
    // alignSelf: 'flex-start',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#7189FF',
  },
  light: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
  },
  lightText: {
    color: '#000000',
  },
  text: { color: '#FFFFFF', marginLeft: 10, fontFamily: '$semiboldFont' },
});
export default IconButton;
