import React from 'react';
import { View, Button, Pressable, Text } from 'react-native';
import NewCase from '../assets/images/new-case.svg';
import EStyleSheet from 'react-native-extended-stylesheet';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';

const FAB = ({ ...props }) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.4 : 1.0 }]}
      {...props}
      // android_ripple={{ borderless: true }}
    >
      <Text style={styles.text}>⏰</Text>
      {/* <NewCase width={35} /> */}
    </Pressable>
  );
};
const styles = EStyleSheet.create({
  fab: {
    backgroundColor: '$grannySmithApple',
    borderRadius: 100,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 50,
    right: 25,
    width: RFPercentage(13),
    height: RFPercentage(13),
    elevation: 5,
  },
  text: {
    fontSize: RFPercentage(7),
  },
});
export default FAB;
