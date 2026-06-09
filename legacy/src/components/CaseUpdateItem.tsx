import React from 'react';
import { View, Text, Pressable } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Case } from '../types';
import { CaseUpdateItem } from '../types';
import fromNow from '../utils/fromNow';
import ProgressBar from './ProgressBar';
import { ProgressBar as NoUpdatesProgressBar } from 'react-native-paper';
import { sendPushNotification } from '../lib/supabase/store';
import Toast from 'react-native-toast-message';
import { useUser } from '../providers/UserContext';
import ShadowStyle from '../constants/ShadowStyle';
import secondsToTimeString from '../utils/secondsToTimeString';
import UpdateTitle from './UpdateTitle';
import { useMixpanel } from '../providers/MixpanelContext';

interface Props {
  isPublic: boolean;
  caseUpdateItem: CaseUpdateItem;
  caseItem: Case;
  navigation: any;
}

const CaseUpdateItemComponent = ({
  isPublic,
  caseUpdateItem,
  caseItem,
  navigation,
}: Props) => {
  const { user } = useUser();
  const mixpanel = useMixpanel();

  const handleWave = async (
    pushToken: string,
    receiverId: string,
    taskId: number,
    taskTitle: string
  ) => {
    mixpanel?.track('Nudged', {
      Nudger: user?.id,
      Nudgee: receiverId,
      'Task ID': taskId,
    });
    await sendPushNotification(
      pushToken,
      receiverId,
      'nudge',
      "You've Been Nudged",
      `${user?.firstName} nudged you for ${taskTitle}!`,
      null,
      null,
      taskId
    );
    Toast.show({
      type: 'success',
      position: 'top',
      text1: 'Nudge Sent Successfully',
      text2: "They'll be notified!",
      topOffset: 50,
    });
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text
          style={{
            color: '#43A4EB',
            fontFamily: 'open-sans-bold',
            fontSize: 16,
          }}
        >
          <UpdateTitle
            timeSpent={caseUpdateItem.timeSpent}
            totalTime={caseUpdateItem.totalTime}
          />
        </Text>
        <Text style={{ fontFamily: 'open-sans-bold', fontSize: 16 }}>
          {fromNow(caseUpdateItem.createdAt)}
        </Text>
      </View>
      <View style={styles.taskButton}>
        <View style={{ flex: 1 }}>
          <Pressable
            style={styles.task}
            onPress={() =>
              navigation.navigate('Task', {
                taskId: caseUpdateItem.task.id,
              })
            }
          >
            <Text style={styles.taskText}>{caseUpdateItem.task.title}</Text>
          </Pressable>
          <View style={styles.progressBarContainer}>
            <View style={{ width: '100%', ...ShadowStyle }}>
              <ProgressBar
                oldProgress={caseUpdateItem.oldProgress}
                newProgress={caseUpdateItem.newProgress}
                style={{ height: 12, elevation: 10, borderRadius: 10 }}
              />
            </View>
          </View>
        </View>
        <View style={{ justifyContent: 'center' }}>
          <Pressable
            style={({ pressed }) => [
              styles.clock,
              {
                opacity: pressed ? 0.4 : 1.0,
                backgroundColor: isPublic ? '#7189FF' : '#96DE90',
              },
            ]}
            onPress={() => {
              if (isPublic) {
                handleWave(
                  caseUpdateItem.pushToken,
                  caseUpdateItem.userId,
                  caseUpdateItem.task.id,
                  caseUpdateItem.task.title
                );
              } else {
                navigation.navigate('ClockIn', {
                  task: caseUpdateItem.task,
                });
              }
            }}
          >
            <Text style={{ fontSize: 25 }}>{isPublic ? '👋' : '⏰'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = EStyleSheet.create({
  taskButton: {
    backgroundColor: '#5F605F',
    marginVertical: 5,
    borderRadius: 10,
    flexDirection: 'row',
    ...ShadowStyle,
  },
  task: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  progressBarContainer: {
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clock: {
    backgroundColor: '$grannySmithApple',
    borderRadius: 999,
    padding: 10,
    margin: 10,
    ...ShadowStyle,
  },
  taskText: {
    fontFamily: '$boldFont',
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default CaseUpdateItemComponent;
