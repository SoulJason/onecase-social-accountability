import React, { useState } from 'react';
import { Pressable } from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';
import { Ionicons } from '@expo/vector-icons';
import Popover from 'react-native-popover-view';
import PopoverContent from './PopoverContent';

interface Props {
  backgroundColor: string;
  iconName: any;
  prompt: string;
  buttonColor: string;
  buttonText: string;
  onButtonPress: () => void;
  onOpenStart: () => void;
  onCloseComplete: () => void;
}

const TaskPopoverButton = ({
  backgroundColor,
  iconName,
  prompt,
  buttonColor,
  buttonText,
  onButtonPress,
  onOpenStart,
  onCloseComplete,
}: Props) => {
  const [visible, setVisible] = useState(false);
  return (
    <Popover
      isVisible={visible}
      popoverStyle={styles.popover}
      arrowStyle={styles.popoverArrow}
      verticalOffset={-30}
      onOpenStart={onOpenStart}
      onRequestClose={() => setVisible(false)}
      onCloseComplete={onCloseComplete}
      from={
        <Pressable
          onPress={() => setVisible(true)}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.4 : 1.0,
              backgroundColor: backgroundColor,
              justifyContent: 'center',
              alignItems: 'center',
              height: 50,
              width: 50,
              alignSelf: 'center',
              marginRight: 2,
              borderRadius: 10,
            },
          ]}
        >
          <Ionicons name={iconName} size={24} color='white' />
        </Pressable>
      }
    >
      <PopoverContent
        prompt={prompt}
        buttonColor={buttonColor}
        buttonText={buttonText}
        onButtonPress={() => {
          onButtonPress();
          setVisible(false);
        }}
      />
    </Popover>
  );
};

const styles = EStyleSheet.create({
  popover: {
    backgroundColor: '#53575F',
    borderRadius: 7,
  },
  popoverArrow: { backgroundColor: 'transparent' },
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
  popoverActionButtonText: {
    marginLeft: 5,
    fontFamily: '$normalFont',
    color: '#FFFFFF',
  },
});

export default TaskPopoverButton;
