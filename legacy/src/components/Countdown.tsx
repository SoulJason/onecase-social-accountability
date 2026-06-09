import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  AppState,
  AppStateStatus,
} from 'react-native';
import Modal from 'react-native-modal';
import EStyleSheet from 'react-native-extended-stylesheet';
import WideButton from '../components/WideButton';
import Timer from '../assets/images/timer.svg';
import Slider from 'react-native-slider';
import { Icon } from 'react-native-elements';
import Toast from 'react-native-toast-message';
import TimerDisplay from './TimerDisplay';
import Button from './Button';
import useAppState from 'react-native-appstate-hook';
import { useUser } from '../providers/UserContext';
import { updateUserHasFailedClockIn } from '../lib/supabase/store';
import { useMixpanel } from '../providers/MixpanelContext';
import { useNavigation } from '@react-navigation/native';
import useAddClockIn from '../mutations/useAddClockIn';
import useUpdateClockIn from '../mutations/useUpdateClockIn';
import apiCaller from '../utils/apiCaller';

const Countdown = (props: any) => {
  const { task } = props;
  const { user } = useUser();
  const navigation = useNavigation();
  const [value, setValue] = useState(0);
  const [isClockedIn, setClockedIn] = useState(false);
  const [isClockOutModalVisible, setClockOutModalVisible] = useState(false);
  const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);
  const { hours = 0, minutes = 0, seconds = 0 } = props;
  const [[initialHours, initialMinutes, initialSeconds], setInitialTime] =
    useState([hours, minutes, seconds]);
  const [[hrs, mins, secs], setTime] = useState([hours, minutes, seconds]);
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [cancelEndTime, setCancelEndTime] = useState<Date>();
  const [cancelSecondsLeft, setCancelSecondsLeft] = useState(10);
  const [failEndTime, setFailEndTime] = useState<Date | null>(null);
  const [isFailure, setIsFailure] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasStartedTracking, setHasStartedTracking] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const appState = useRef(AppState.currentState);
  const mixpanel = useMixpanel();
  const addClockInMutation = useAddClockIn(
    task.id,
    endTime,
    initialHours * 3600 + initialMinutes * 60 + initialSeconds
  );
  const updateClockInMutation = useUpdateClockIn(task.id, false);
  // TODO: When RN version >= 0.65, can use
  // const { appState } = useAppState({
  //   onForeground: () => {
  //     if (failEndTime) {
  //       const deltaTime = Math.round(
  //         (failEndTime.getTime() - Date.now()) / 1000
  //       );
  //       if (deltaTime < 0) {
  //         console.log('USER HAS FAILED.');
  //       }
  //     }
  //   },
  //   onBackground: () => {
  //     setFailEndTime(new Date(Date.now() + 10 * 1000)); // Fail user 10 seconds from now
  //   },
  // });
  let inactiveTime = new Date();
  let backgroundTime = new Date();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleLeave = (e: any) => {
    if (
      e.data.action.type === 'REPLACE' ||
      !isClockedIn ||
      (isClockedIn && cancelSecondsLeft > 0)
    ) {
      return;
    }
    // Prevent default behavior of leaving the screen
    e.preventDefault();

    Toast.show({
      type: 'error',
      position: 'top',
      text1: 'Cannot leave',
      text2: 'You must clock out!',
      topOffset: 50,
    });
  };

  useEffect(() => {
    navigation.addListener('beforeRemove', handleLeave);
    return () => {
      navigation.removeListener('beforeRemove', handleLeave);
    };
  }, [isClockedIn, cancelSecondsLeft]);

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange);
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, [failEndTime, cancelSecondsLeft]);

  useEffect(() => {
    if (cancelSecondsLeft === 0 && !hasStartedTracking) {
      setHasStartedTracking(true);
      addClockInMutation.mutate();
      mixpanel?.time_event('Clocked out');
      mixpanel?.track('Passed 10 seconds', { 'Task ID': props.task.id });
    }
  }, [cancelSecondsLeft, hasStartedTracking]);

  useEffect(() => {
    if (isFailure || isSuccess) {
      const secondsPassed =
        initialHours * 3600 +
        initialMinutes * 60 +
        initialSeconds -
        (hrs * 3600 + mins * 60 + secs);
      mixpanel?.track('Clocked out', {
        'Is Success': isSuccess,
        'Task ID': props.task.id,
      });
      updateClockInMutation.mutate();
      props.navigation.replace('TaskProgress', {
        task: props.task,
        totalTime: [initialHours, initialMinutes, initialSeconds],
        secondsPassed,
        isFailure,
      });
    }
  }, [isFailure, isSuccess]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.current === 'active' && nextAppState === 'inactive') {
      inactiveTime = new Date();
    }
    if (appState.current === 'inactive' && nextAppState === 'background') {
      const timeElapsed = new Date().getTime() - inactiveTime.getTime();
      if (timeElapsed > 100) {
        // User left app
        if (cancelSecondsLeft > 0) {
          handleCancel();
        } else {
          setFailEndTime(new Date(Date.now() + 10 * 1000)); // Fail user 10 seconds from now
          apiCaller
            .post('/fail-notification', {
              userId: user?.id,
            })
            .catch((error) => {
              // console.log('Error', error);
            });
        }
      } else {
        // User put phone to sleep
      }
    }
    if (appState.current === 'background' && nextAppState === 'active') {
      if (failEndTime) {
        const deltaTime = Math.round(
          (failEndTime.getTime() - Date.now()) / 1000
        );
        if (cancelSecondsLeft <= 0) {
          if (deltaTime > 0) {
            if (deltaTime > 5) {
              await updateUserHasFailedClockIn(false);
            }
            setFailEndTime(null);
          } else {
            setIsFailure(true);
          }
        }
      }
    }
    // code below works well when phone sleep is considered leaving the app
    // if (
    //   appState.current.match(/inactive|background/) &&
    //   nextAppState === 'active'
    // ) {
    //   if (failEndTime) {
    //     const deltaTime = Math.round(
    //       (failEndTime.getTime() - Date.now()) / 1000
    //     );
    //     if (deltaTime <= 0 && cancelSecondsLeft <= 0) {
    //       // setIsFailure(true);
    //     }
    //   }
    // } else {
    //   if (cancelSecondsLeft > 0) {
    //     console.log('CANCEL SECONDS LEFT?', cancelSecondsLeft);
    //     // handleCancel();
    //   } else {
    //     setFailEndTime(new Date(Date.now() + 10 * 1000)); // Fail user 10 seconds from now
    //   }
    // }
    appState.current = nextAppState;
  };

  const tick = () => {
    setEndTime((originalEndTime) => {
      // console.log(`${hrs}:${mins}:${secs}`);
      //Time until the end of the countdown in seconds
      let deltaTime = 1;
      if (originalEndTime) {
        deltaTime = Math.round((originalEndTime.getTime() - Date.now()) / 1000);
      }
      let secondsLeft = deltaTime;
      // console.log('SECONDS', hrs * 3600 + mins * 60 + secs);
      const hoursLeft = Math.floor(secondsLeft / 3600);
      secondsLeft %= 3600;
      const minutesLeft = Math.floor(secondsLeft / 60);
      secondsLeft %= 60;
      if (hoursLeft <= 0 && minutesLeft <= 0 && secondsLeft <= 0) {
        setClockedIn(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          // setUpdateModalVisible(true);
        }
        setTime([0, 0, 0]);
        setIsSuccess(true);
      } else {
        setTime([hoursLeft, minutesLeft, secondsLeft]);
      }
      return originalEndTime;
      // if (hrs === 0 && mins === 0 && secs === 0) {
      //   setClockedIn(false);

      //   if (timerRef.current) {
      //     clearInterval(timerRef.current);
      //     setUpdateModalVisible(true);
      //   }
      //   return [0, 0, 0];
      // } else if (mins === 0 && secs === 0) {
      //   return [hrs - 1, 59, 59];
      // } else if (secs === 0) {
      //   return [hrs, mins - 1, 59];
      // } else {
      //   return [hrs, mins, secs - 1];
      // }
    });

    setCancelEndTime((originalCancelEndTime) => {
      let deltaTime = 1;
      if (originalCancelEndTime) {
        deltaTime = Math.round(
          (originalCancelEndTime.getTime() - Date.now()) / 1000
        );
      }
      if (deltaTime > 0) {
        setCancelSecondsLeft(deltaTime);
      } else {
        setCancelSecondsLeft(0);
      }
      return originalCancelEndTime;
    });
  };

  const handleTimerChange = (value: number) => {
    const newHrs = Math.floor(value / 12);
    const newMins = (value % 12) * 5;
    setValue(value);
    setTime([newHrs, newMins, 0]);
    // setTime([0, 0, 20]); // test time
  };

  const startCountdown = () => {
    if (hrs !== 0 || mins !== 0 || secs !== 0) {
      // setEndTime(new Date(Date.now() + (hrs * 3600 + mins * 60 + secs) * 1000));
      mixpanel?.track('Started clock in', { 'Task ID': props.task.id });
      setInitialTime([hrs, mins, secs]);
      setClockedIn(true);
      setCancelEndTime(new Date(Date.now() + 10 * 1000));
      setEndTime(new Date(Date.now() + (hrs * 3600 + mins * 60 + secs) * 1000));
      timerRef.current = setInterval(() => tick(), 1000);
    } else {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Invalid time',
        text2: 'Select a value greater than 0!',
        topOffset: 50,
      });
    }
  };

  const handleCancel = () => {
    mixpanel?.track('Cancelled clock in', { 'Task ID': props.task.id });
    setCancelSecondsLeft(10);
    setClockedIn(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTime([initialHours, initialMinutes, initialSeconds]);
  };

  const stopCountdown = () => {
    setClockedIn(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setClockOutModalVisible(false);
    setIsFailure(true);
    // setClockOutModalVisible(false);
    // setUpdateModalVisible(true);
  };

  let hrText = hrs > 0 ? `${hrs.toString().padStart(1, '0')}:` : '';
  let minText = `${mins.toString().padStart(2, '0')}:`;
  let secText = `${secs.toString().padStart(2, '0')}`;

  const timeText = `${hrText}${minText}${secText}`;

  return (
    <>
      <TimerDisplay timeText={timeText} />
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginVertical: 25,
        }}
      >
        {!isClockedIn ? (
          <Slider
            style={{ width: 320 }}
            minimumValue={0}
            maximumValue={24}
            step={1}
            value={value}
            onValueChange={handleTimerChange}
            trackStyle={styles.sliderTrack}
            thumbStyle={styles.sliderThumb}
            minimumTrackTintColor='#ADE2A8'
            maximumTrackTintColor='#C4C4C4'
          />
        ) : null}
      </View>

      {!isClockedIn ? (
        <Button
          style={{ width: '80%' }}
          type='success'
          onPress={startCountdown}
        >
          ⏰ Clock In
        </Button>
      ) : (
        <>
          {cancelSecondsLeft !== 0 ? (
            <Button type='secondary' onPress={handleCancel}>
              Cancel ({cancelSecondsLeft})
            </Button>
          ) : (
            <Button type='danger' onPress={() => setClockOutModalVisible(true)}>
              ⏰ Clock Out
            </Button>
          )}
        </>
      )}
      <Modal
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
      </Modal>
      <Modal
        isVisible={isUpdateModalVisible}
        animationIn='slideInLeft'
        animationOut='slideOutRight'
        onBackdropPress={() => setUpdateModalVisible(false)}
        backdropTransitionOutTiming={0}
      >
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>
            Give us an <Text style={styles.modalTitleUpdate}>update</Text>
          </Text>
          <TimerDisplay timeText={timeText} additionalText='passed' />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              multiline={true}
              numberOfLines={18}
              maxLength={1000}
              onChangeText={(value) => console.log(value)}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.icon}>
                <Icon
                  name='ios-image-outline'
                  type='ionicon'
                  // onPress={handleImagePress}
                />
              </View>
              <Pressable style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = EStyleSheet.create({
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
  modal: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    elevation: 10,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: '$heading',
    fontFamily: '$boldFont',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalTitleClock: {
    color: '#E56E6E',
  },
  modalTitleUpdate: {
    color: '$ceruleanFrost',
  },
  modalContent: {
    color: '#6D6D6D',
    fontSize: '$body',
    fontFamily: '$normalFont',
    marginVertical: 24,
    textAlign: 'center',
  },
  modalButton: {
    width: 100,
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  modalButtonText: {
    fontFamily: '$normalFont',
    fontSize: '$body',
    color: 'white',
    textAlign: 'center',
  },
  inputContainer: {
    marginTop: 25,
    padding: 10,
    backgroundColor: '#FFFCF7',
    elevation: 5,
    width: '100%',
    borderRadius: 10,
  },
  input: {
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '$ceruleanFrost',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  submitButtonText: {
    fontFamily: '$boldFont',
    fontSize: '$body',
    color: 'white',
    textAlign: 'center',
  },
});

export default Countdown;
