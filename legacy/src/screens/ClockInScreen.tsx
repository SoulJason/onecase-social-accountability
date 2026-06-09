import React from 'react';
import { Text, View, Dimensions } from 'react-native';
import Countdown from '../components/Countdown';
import EStyleSheet from 'react-native-extended-stylesheet';

import { RouteProp } from '@react-navigation/core';
import { StackParamList } from '../navigation/SignInStack';
import { StackNavigationProp } from '@react-navigation/stack';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'ClockIn'>;
  route: RouteProp<StackParamList, 'ClockIn'>;
}

function ClockInScreen({ navigation, route }: Props) {
  const { task } = route.params;
  const { id, title, description, image } = task;
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          alignItems: 'center',
          marginTop: 100,
          marginHorizontal: 25,
        }}
      >
        <Text style={styles.titleText}>{title}</Text>
        <Countdown task={task} navigation={navigation} />
      </View>

      <View style={{ marginTop: 20, marginHorizontal: 10 }}>
        <Text style={styles.description}>
          If you leave the app for more than 10 seconds, you will automatically
          clock out.
        </Text>
      </View>
    </View>
  );
}

const styles = EStyleSheet.create({
  titleBanner: {
    backgroundColor: '$ceruleanFrost',
    elevation: 5,
  },
  titleText: {
    padding: 10,
    color: 'black',
    fontFamily: '$boldFont',
    fontSize: '$heading',
    marginBottom: 25,
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
  sliderTrack: {
    height: 25,
    borderRadius: 10,
    backgroundColor: '#d0d0d0',
  },
  sliderThumb: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: '$grannySmithApple',
  },
  description: {
    color: '#A0A0A0',
    fontSize: '$body',
    fontFamily: '$normalFont',
    textAlign: 'center',
  },
});

export default ClockInScreen;
