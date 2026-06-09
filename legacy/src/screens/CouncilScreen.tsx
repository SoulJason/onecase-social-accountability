import React from 'react';
import { Text, View } from 'react-native';
import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParamList } from '../navigation/SignInStack';
import CouncilCaseList from '../components/councils/CouncilCaseList';
import useCouncilUpdates from '../queries/useCouncilUpdates';
import CouncilUpdateList from '../components/councils/CouncilUpdateList';
import { CouncilUpdate, LiveUpdate } from '../types';
import useClockIns from '../queries/useClockIns';
import * as Sentry from 'sentry-expo';
// interface Props {
//   navigation: StackNavigationProp<StackParamList, 'Council'>;
//   route: RouteProp<StackParamList, 'Council'>;
// }
function CouncilScreen({ navigation }: any) {
  const {
    data: liveUpdates,
    isLoading: liveUpdatesLoading,
    refetch: liveUpdatesRefetch,
  } = useClockIns();
  const { data, isLoading, refetch } = useCouncilUpdates();
  if (liveUpdatesLoading || isLoading) {
    return null;
  }
  let updates: Array<LiveUpdate | CouncilUpdate> = [];
  updates = updates.concat(liveUpdates as LiveUpdate[]);
  updates = updates.concat(data as CouncilUpdate[]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          marginTop: 10,
          width: '100%',
          // paddingHorizontal: 15,
          flex: 1,
          // justifyContent: 'center',
        }}
      >
        <CouncilUpdateList
          // liveUpdates={liveUpdates as LiveUpdate[]}
          updates={updates}
          refetch={() => {
            liveUpdatesRefetch();
            refetch();
          }}
        />
        {/* <CouncilCaseList navigation={navigation} /> */}
      </View>
    </View>
  );
}

export default CouncilScreen;
