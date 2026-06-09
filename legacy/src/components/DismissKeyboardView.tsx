import React from 'react';
import { Pressable, Keyboard, View } from 'react-native';

const DismissKeyboardHOC = (Comp: any) => {
  return ({
    children,
    pressableStyle,
    ...props
  }: {
    children: React.ReactNode;
    pressableStyle?: any;
    [x: string]: any;
  }) => (
    <Pressable
      style={{ flex: 1, ...pressableStyle }}
      onPress={Keyboard.dismiss}
      accessible={false}
    >
      <Comp {...props}>{children}</Comp>
    </Pressable>
  );
};

const DismissKeyboardView = DismissKeyboardHOC(View);

export default DismissKeyboardView;
