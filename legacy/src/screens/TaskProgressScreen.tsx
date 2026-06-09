import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import { RouteProp } from '@react-navigation/core';
import { StackParamList } from '../navigation/SignInStack';
import { StackNavigationProp } from '@react-navigation/stack';
import TimerDisplay from '../components/TimerDisplay';
import Slider from 'react-native-slider';
import Button from '../components/Button';
import ChangeProgressModal from '../components/ChangeProgressModal';
import { addUpdate } from '../lib/supabase/store';
import Modal from '../components/Modal';

import Toast from 'react-native-toast-message';
import useAddUpdate from '../mutations/useAddUpdate';
import { useMixpanel } from '../providers/MixpanelContext';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'TaskProgress'>;
  route: RouteProp<StackParamList, 'TaskProgress'>;
}

function TaskProgressScreen({ navigation, route }: Props) {
  const { task, totalTime, secondsPassed, isFailure } = route.params;
  const { id, title, progress } = task;
  const [timerHrs, timerMins, timerSecs] = totalTime;

  const [newProgress, setNewProgress] = useState(progress);
  const [isChangeProgressModalVisible, setIsChangeProgressModalVisible] =
    useState(false);
  const [isNoProgressModalVisible, setIsNoProgressModalVisible] =
    useState(false);

  const secondsTotal = timerHrs * 3600 + timerMins * 60 + timerSecs;

  const hoursSpent = Math.floor(secondsPassed / 3600);
  const minutesSpent = Math.floor((secondsPassed % 3600) / 60);
  const secondsSpent = Math.floor((secondsPassed % 3600) % 60);

  let hrText =
    hoursSpent > 0 ? `${hoursSpent.toString().padStart(1, '0')}:` : '';
  let minText = `${minutesSpent.toString().padStart(2, '0')}:`;
  let secText = `${secondsSpent.toString().padStart(2, '0')}`;

  const timeText = `${hrText}${minText}${secText}`;

  let currentProgressText = `${progress * 100}%`;
  let differenceText = '';
  if (newProgress !== progress) {
    currentProgressText += ` ${newProgress > progress ? '+' : '-'}`;
    differenceText = ` ${Math.abs(
      ((newProgress * 100000000 - progress * 100000000) / 100000000) * 100
    ).toFixed(0)}%`;
  }

  const addUpdateMutation = useAddUpdate(
    task.id,
    progress,
    newProgress,
    secondsPassed,
    secondsTotal
  );
  const mixpanel = useMixpanel();

  const handleChangeProgress = async () => {
    addUpdateMutation.mutate();
    mixpanel?.track('Clocked in', {
      Type: 'Countdown',
      'Is Success': !isFailure,
      'Task ID': task.id,
      'Old Progress': progress,
      'New Progress': newProgress,
    });
    setIsChangeProgressModalVisible(false);
    navigation.goBack();
  };

  const clockIt = () => {
    if (progress !== newProgress) {
      setIsChangeProgressModalVisible(true);
    } else {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Invalid value',
        text2: 'Use the slider to select your new progress!',
        topOffset: 50,
      });
    }
  };

  return (
    <View>
      <View
        style={[
          styles.banner,
          {
            backgroundColor: isFailure ? '#E56E6E' : '#96DE90',
          },
        ]}
      >
        <Text style={styles.titleText}>
          {isFailure ? 'You Failed!' : 'Congrats On Finishing!'}
        </Text>
      </View>
      <View style={styles.titleBanner}>
        <Text style={styles.titleText}>Any Progress?</Text>
      </View>
      <View style={{ alignItems: 'center', marginHorizontal: 25 }}>
        <Text style={{ color: '#4B4B4B', fontSize: 20, marginBottom: 25 }}>
          {title}
        </Text>
        <Text
          style={{ fontFamily: 'open-sans', fontSize: 15, marginBottom: 5 }}
        >
          Time Spent
        </Text>
        <TimerDisplay timeText={timeText} style={{ marginBottom: 15 }} />
        <Slider
          style={{ width: '100%' }}
          value={progress}
          trackStyle={styles.sliderTrack}
          thumbStyle={[styles.sliderThumb, { backgroundColor: 'white' }]}
          minimumTrackTintColor='#ADE2A8'
          maximumTrackTintColor='#C4C4C4'
          onSlidingComplete={(value: number) => {
            if (value !== progress) {
              setNewProgress(Math.round((value + Number.EPSILON) * 100) / 100); // round to 2 decimal places
            }
          }}
        />
        <Text style={{ fontFamily: 'open-sans-bold', fontSize: 30 }}>
          {currentProgressText}
          {differenceText !== '' ? (
            <Text
              style={{
                color: newProgress > progress ? '#43A4EB' : '#E56E6E',
              }}
            >
              {differenceText}
            </Text>
          ) : null}
        </Text>

        <Button
          type='primary'
          style={{ width: '50%', marginTop: 30 }}
          onPress={clockIt}
        >
          Clock It
        </Button>
        <Button
          type='secondary'
          style={{ width: '50%', marginTop: 30 }}
          onPress={() => setIsNoProgressModalVisible(true)}
        >
          Nope
        </Button>
        <Modal
          visible={isChangeProgressModalVisible}
          title={
            <>
              Change progress from{'\n'}
              {progress * 100}% to{' '}
              <Text
                style={{
                  color: newProgress > progress ? '#43A4EB' : '#E56E6E',
                }}
              >
                {(newProgress * 100).toFixed(0)}%
              </Text>
              ?
            </>
          }
          content='You will have to provide an update for what you’ve done'
          onNo={() => setIsChangeProgressModalVisible(false)}
          onYes={handleChangeProgress}
          titleStyle={{ textAlign: 'center' }}
          noText='Cancel'
          yesText='Yes'
        />
        <Modal
          visible={isNoProgressModalVisible}
          title="Don't clock in any progress?"
          onNo={() => setIsNoProgressModalVisible(false)}
          onYes={() => {
            mixpanel?.track('Clocked no progress', {
              'Is Success': !isFailure,
              'Task ID': task.id,
            });
            setIsChangeProgressModalVisible(false);
            setIsNoProgressModalVisible(false);
            navigation.goBack();
          }}
          noText='Cancel'
          yesText='Yes'
        />
        {/* <Modal
        isVisible={isClockOutModalVisible}
        animationIn='slideInDown'
        animationOut='slideOutRight'
        backdropTransitionOutTiming={0}
      >
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>
            Are you sure you want to{' '}
            <Text style={styles.modalTitleClock}>clock</Text> out early?
          </Text>
          <Text style={styles.modalContent}>Your friends will be notified</Text>
          <View
            style={{
              flexDirection: 'row',
              // justifyContent: 'space-around',
              // alignItems: 'flex-end',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Pressable
              style={[styles.modalButton, { backgroundColor: '#9A9A9A' }]}
              onPress={() => setClockOutModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>No</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, { backgroundColor: '#FF5858' }]}
              onPress={stopCountdown}
            >
              <Text style={styles.modalButtonText}>Give Up</Text>
            </Pressable>
          </View>
        </View>
      </Modal> */}
      </View>
    </View>
  );
}

const styles = EStyleSheet.create({
  banner: {
    marginBottom: 10,
  },
  titleBanner: {
    backgroundColor: '#C4C4C4',
    marginBottom: 25,
  },
  titleText: {
    padding: 10,
    color: 'white',
    fontFamily: '$boldFont',
    fontSize: '$heading',
    textAlign: 'center',
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
});

export default TaskProgressScreen;
