import React from 'react';
import { Text, TextStyle, View } from 'react-native';
import secondsToTimeString from '../utils/secondsToTimeString';

interface Props {
  timeSpent: number;
  totalTime: number;
  textStyle: TextStyle;
}
const UpdateTitle = ({ timeSpent, totalTime, textStyle }: Props) => {
  if (timeSpent === 0 && totalTime === 0) {
    return (
      <Text
        style={[
          {
            color: '#43A4EB',
            fontFamily: 'open-sans-bold',
            fontSize: 16,
          },
          textStyle,
        ]}
      >
        off the books
      </Text>
    );
  } else if (timeSpent === totalTime) {
    return (
      <Text
        style={[
          {
            color: '#43A4EB',
            fontFamily: 'open-sans-bold',
            fontSize: 16,
          },
          textStyle,
        ]}
      >
        {secondsToTimeString(totalTime)}
      </Text>
    );
  } else {
    return (
      <View style={{ flexDirection: 'row' }}>
        <Text
          style={[
            {
              color: '#FF3131',
              fontFamily: 'open-sans-bold',
              fontSize: 16,
              textDecorationLine: 'line-through',
              textDecorationColor: 'black',
            },
            textStyle,
          ]}
        >
          {secondsToTimeString(totalTime)}
        </Text>
        <Text
          style={[
            {
              color: '#43A4EB',
              fontFamily: 'open-sans-bold',
              fontSize: 16,
              marginLeft: 5,
            },
            textStyle,
          ]}
        >
          {secondsToTimeString(timeSpent)}
        </Text>
      </View>
    );
  }
};

export default UpdateTitle;
