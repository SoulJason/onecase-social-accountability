import React from 'react';
import { View, Text, Pressable, GestureResponderEvent } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

interface Props {
  prompt: string;
  buttonColor: string;
  buttonText: string;
  onButtonPress?: (event: GestureResponderEvent) => void;
}

const PopoverContent = ({
  prompt,
  buttonColor,
  buttonText,
  onButtonPress,
}: Props) => {
  return (
    <>
      <Text style={styles.popoverPrompt}>{prompt}</Text>
      <View style={{ height: 1, backgroundColor: '#929292' }} />
      <Pressable
        onPress={onButtonPress}
        style={({ pressed }) => [
          styles.popoverButton,
          {
            opacity: pressed ? 0.4 : 1.0,
          },
        ]}
      >
        <Text style={[styles.popoverButtonText, { color: buttonColor }]}>
          {buttonText}
        </Text>
      </Pressable>
    </>
  );
};

const styles = EStyleSheet.create({
  popoverPrompt: {
    color: '#FFFFFF',
    fontFamily: '$normalFont',
    padding: 10,
  },
  popoverButton: {
    alignItems: 'center',
    padding: 10,
  },
  popoverButtonText: {
    fontFamily: '$boldFont',
  },
});

export default PopoverContent;
