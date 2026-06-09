import React from 'react';
import { View, Text } from 'react-native';
import Modal from 'react-native-modal';
import EStyleSheet from 'react-native-extended-stylesheet';
import Timer from '../assets/images/timer.svg';

interface Props {
  timeText: string;
  additionalText?: string;
  style?: {
    [x: string]: any;
  };
}
const TimerDisplay = ({ timeText, additionalText, style }: Props) => (
  <View style={[styles.timerContainer, style]}>
    <Timer />
    <View style={styles.timerTextContainer}>
      <Text style={[styles.timerText, additionalText && { fontSize: 28 }]}>
        {timeText}
        {additionalText ? ` ${additionalText}` : ''}
      </Text>
    </View>
  </View>
);

const styles = EStyleSheet.create({
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 60,
    fontFamily: '$boldFont',
    color: 'white',
  },
});

export default TimerDisplay;
