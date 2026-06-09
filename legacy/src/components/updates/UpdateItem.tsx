import React from 'react';
import { View, Text } from 'react-native';

import { Update } from '../../types';
import fromNow from '../../utils/fromNow';
import secondsToTimeString from '../../utils/secondsToTimeString';
import ProgressBar from '../ProgressBar';
import UpdateTitle from '../UpdateTitle';

interface Props {
  update: Update;
}
const UpdateItem = ({ update }: Props) => {
  const { timeSpent, totalTime } = update;

  const percentageGain =
    ((update.newProgress * 100000000 - update.oldProgress * 100000000) /
      100000000) *
    100;

  return (
    <View style={{ marginVertical: 10, marginHorizontal: 25 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <UpdateTitle timeSpent={timeSpent} totalTime={totalTime} />
        <Text style={{ fontFamily: 'open-sans-bold', fontSize: 16 }}>
          {fromNow(update.createdAt)}
        </Text>
      </View>
      <View style={{ marginTop: 5 }}>
        <View
          style={{
            backgroundColor: '#5F605F',
            padding: 15,
            borderRadius: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ width: '85%' }}>
            <ProgressBar
              oldProgress={update.oldProgress}
              newProgress={update.newProgress}
              style={{ height: 12, elevation: 10, borderRadius: 10 }}
            />
          </View>
          <Text
            style={{
              color: 'white',
              fontWeight: 'bold',
              fontFamily: 'open-sans-bold',
            }}
          >
            {percentageGain > 0 ? '+' : ''}
            {percentageGain.toFixed(0)}%
          </Text>
        </View>
      </View>
    </View>
  );
};

export default UpdateItem;
