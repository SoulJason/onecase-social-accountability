import React from 'react';
import { View } from 'react-native';
import { Case } from '../../types';
import TaskList from './TaskList';

import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  caseItem: Case;
  navigation: any;
}
const CaseTab = ({ caseItem, navigation }: Props) => {
  return (
    <View>
      {/* <View style={{ justifyContent: 'center', alignItems: 'center' }}> */}
      {/* <View style={{ width: '100%' }}> */}
      <TaskList caseItem={caseItem} navigation={navigation} />
      {/* </View> */}
      {/* </View> */}
    </View>
  );
};

export default CaseTab;
