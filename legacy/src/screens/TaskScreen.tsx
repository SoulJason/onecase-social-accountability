import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Text, View, Image, Pressable, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParamList } from '../navigation/SignInStack';
import EStyleSheet from 'react-native-extended-stylesheet';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from 'react-native-slider';

import AvatarRow from '../components/AvatarRow';
import WideButton from '../components/WideButton';
import ChangeProgressModal from '../components/ChangeProgressModal';
import UpdateList from '../components/updates/UpdateList';
import Button from '../components/Button';
import useAddUpdate from '../mutations/useAddUpdate';
import useUpdates from '../queries/useUpdates';
import { ActivityIndicator, ProgressBar } from 'react-native-paper';
import useTaskByTaskId from '../queries/useTaskByTaskId';
import { useUser } from '../providers/UserContext';
import FAB from '../components/FAB';
import { Avatar } from 'react-native-elements';
import CommentList from '../components/tasks/CommentList';
import { Case } from '../types';
import { useMixpanel } from '../providers/MixpanelContext';
import ShadowStyle from '../constants/ShadowStyle';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Task'>;
  route: RouteProp<StackParamList, 'Task'>;
}

const users = [
  {
    name: 'Lawrence Lin',
    profilePicture: 'https://uifaces.co/our-content/donated/fyXUlj0e.jpg',
  },
  {
    name: 'James Bayley',
    profilePicture: 'https://randomuser.me/api/portraits/men/85.jpg',
    selected: false,
  },
  {
    name: 'Emperor Palpatine',
    profilePicture: 'https://randomuser.me/api/portraits/men/86.jpg',
    selected: false,
  },
  {
    name: 'Darth Vader',
    profilePicture: 'https://randomuser.me/api/portraits/men/88.jpg',
    selected: false,
  },
  {
    name: 'Thrawn',
    profilePicture: 'https://randomuser.me/api/portraits/men/87.jpg',
    selected: false,
  },
  {
    name: 'John Wick',
    profilePicture: 'https://randomuser.me/api/portraits/men/90.jpg',
    selected: false,
  },
];

function TaskScreen({ navigation, route }: Props) {
  const { taskId } = route.params;
  const councilUsers = users.slice(0, 5);
  const {
    data: {
      id,
      title,
      description,
      image,
      progress,
      createdBy,
      assignedTo,
      caseId,
      caseItem,
      assigner,
      assignee,
      comments,
    } = {
      id: -1,
      title: '',
      description: '',
      image: '',
      progress: 0,
      createdBy: '',
      assignedTo: '',
      caseId: -1,
      caseItem: {
        title: '',
        color: '',
        emoji: '',
      },
    },
    isSuccess,
    isLoading,
    isError,
  } = useTaskByTaskId(taskId);
  const { user } = useUser();

  const isAssignee = assignedTo === user?.id;
  console.log('ASSIGNED TO', assignedTo, user?.id);
  const isEditable = createdBy === user?.id && isAssignee;

  const [sliderProgress, setSliderProgress] = useState(progress);
  const [visible, setVisible] = useState(false);
  const [newProgress, setNewProgress] = useState(progress);
  const [rerenderSlider, setRerenderSlider] = useState(false);
  const { data: updates, isLoading: isUpdatesLoading } = useUpdates(id);
  const addUpdateMutation = useAddUpdate(id, sliderProgress, newProgress, 0, 0);
  const mixpanel = useMixpanel();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitle}>
          <View
            style={[
              styles.headerEmoji,
              {
                backgroundColor: caseItem.color,
              },
            ]}
          >
            <Text style={{ fontSize: 20 }}>{caseItem.emoji}</Text>
          </View>
          <Text style={[styles.headerTitleText, { marginLeft: 10 }]}>
            {caseItem.title}
          </Text>
        </View>
      ),
    });
  }, [navigation, caseItem]);

  useEffect(() => {
    if (isSuccess) {
      setSliderProgress(progress);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (rerenderSlider) {
      setRerenderSlider(false);
    }
  }, [rerenderSlider]);

  const handleChangeProgress = () => {
    addUpdateMutation.mutate();
    mixpanel?.track('Clocked in', { Type: 'Off the books', 'Task ID': taskId });
    setSliderProgress(newProgress);
    setVisible(false);
  };

  const handleCancelProgress = () => {
    setRerenderSlider(true); // react-native-slider does not support control yet, will be possible in v4.2.0
    setSliderProgress(progress); // react-native-slider does not support control yet, will be possible in v4.2.0
    setVisible(false);
  };

  if (isLoading) {
    return null;
  }
  if (isError) {
    return null;
  }

  // Sort comments in descending order
  const commentsData = comments?.sort(
    (a, b) => new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf()
  );
  console.log('IS ASSIGNEE', isAssignee);
  return (
    <>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.titleBanner}>
          <View
            style={{
              flexDirection: 'row',
              marginBottom: 10,
            }}
          >
            {assigner?.id === assignee?.id ? (
              <View>
                <Pressable
                  onPress={() =>
                    navigation.navigate('UserProfile', {
                      userId: assignee?.id ?? '',
                    })
                  }
                >
                  <Avatar
                    size='medium'
                    rounded
                    source={{ uri: assignee?.avatarUrl }}
                    icon={{
                      name: 'user-circle',
                      type: 'font-awesome',
                      color: 'black',
                    }}
                    activeOpacity={0.7}
                  />
                  <Text style={styles.name}>{assignee?.firstName}</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Pressable
                    onPress={() =>
                      navigation.navigate('UserProfile', {
                        userId: assigner?.id ?? '',
                      })
                    }
                  >
                    <Avatar
                      size='medium'
                      rounded
                      source={{ uri: assigner?.avatarUrl }}
                      icon={{
                        name: 'user-circle',
                        type: 'font-awesome',
                        color: 'black',
                      }}
                      activeOpacity={0.7}
                    />
                    <Text style={styles.name}>{assigner?.firstName}</Text>
                  </Pressable>
                </View>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <FontAwesome
                    name='long-arrow-right'
                    size={72}
                    color='white'
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Pressable
                    onPress={() =>
                      navigation.navigate('UserProfile', {
                        userId: assignee?.id ?? '',
                      })
                    }
                  >
                    <Avatar
                      size='medium'
                      rounded
                      source={{ uri: assignee?.avatarUrl }}
                      icon={{
                        name: 'user-circle',
                        type: 'font-awesome',
                        color: 'black',
                      }}
                      activeOpacity={0.7}
                    />
                    <Text style={styles.name}>{assignee?.firstName}</Text>
                  </Pressable>
                </View>
              </>
            )}
            {isEditable ? (
              <Pressable
                style={({ pressed }) => ({
                  opacity: pressed ? 0.4 : 1.0,
                  marginLeft: 'auto',
                })}
                onPress={() => {
                  mixpanel?.track('Pressed edit task', { 'Task ID': id });
                  mixpanel?.time_event('Edited task');
                  navigation.navigate('EditTask', {
                    task: {
                      id,
                      title,
                      description,
                      image,
                      progress,
                      createdBy,
                      assignedTo,
                      caseId,
                    },
                    caseItem: caseItem as Case,
                  });
                }}
              >
                <MaterialCommunityIcons
                  name='checkbox-blank-circle'
                  size={32}
                  color='black'
                />
                <MaterialCommunityIcons
                  name='pencil-circle'
                  size={32}
                  color='white'
                  style={{
                    top: 0,
                    left: 0,
                    position: 'absolute',
                  }}
                />
              </Pressable>
            ) : null}
          </View>
          <Text style={[styles.titleText, { marginBottom: 10 }]}>{title}</Text>
          {isAssignee ? (
            <>
              {rerenderSlider ? (
                <>
                  <Slider
                    style={{ width: '100%' }}
                    value={sliderProgress}
                    trackStyle={styles.sliderTrack}
                    thumbStyle={[
                      styles.sliderThumb,
                      { backgroundColor: 'white' },
                    ]}
                    minimumTrackTintColor='#ADE2A8'
                    maximumTrackTintColor='#C4C4C4'
                    onSlidingComplete={(value: number) => {
                      if (value !== progress) {
                        setNewProgress(
                          Math.round((value + Number.EPSILON) * 100) / 100
                        ); // round to 2 decimal places
                        setVisible(true);
                      }
                    }}
                  />
                </>
              ) : (
                <Slider
                  style={{ width: '100%' }}
                  value={sliderProgress}
                  trackStyle={styles.sliderTrack}
                  thumbStyle={[
                    styles.sliderThumb,
                    { backgroundColor: 'white' },
                  ]}
                  minimumTrackTintColor='#ADE2A8'
                  maximumTrackTintColor='#C4C4C4'
                  onSlidingComplete={(value: number) => {
                    if (value !== progress) {
                      setNewProgress(
                        Math.round((value + Number.EPSILON) * 100) / 100
                      ); // round to 2 decimal places
                      setVisible(true);
                    }
                  }}
                />
              )}

              <ChangeProgressModal
                visible={visible}
                onNo={handleCancelProgress}
                onYes={handleChangeProgress}
                oldProgress={sliderProgress}
                newProgress={newProgress}
              />
            </>
          ) : (
            <View style={{ ...ShadowStyle }}>
              <ProgressBar
                progress={progress}
                color='#96DE90'
                style={styles.sliderTrack}
              />
            </View>
          )}
        </View>
        <View
          style={{
            marginVertical: 15,
          }}
        >
          <View style={{ marginHorizontal: 25 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.description}>{description}</Text>
              {image !== '' && (
                <Image source={{ uri: image }} height={50} width={50} />
                // <Image uri={image} dimensions={imageDim} margin={50} />
              )}
            </View>
            <View style={{ marginTop: 20 }}>
              <Text style={styles.subheadingText}>Updates</Text>
            </View>
          </View>
          <UpdateList
            updates={updates ?? []}
            isPreview={true}
            scrollEnabled={false}
          />
          {isUpdatesLoading ? (
            <ActivityIndicator color='black' />
          ) : (
            <>
              {updates && updates.length > 2 ? (
                <View
                  style={{ justifyContent: 'center', alignItems: 'center' }}
                >
                  <Pressable
                    style={({ pressed }) => ({
                      backgroundColor: '#43A4EB',
                      padding: 10,
                      borderRadius: 10,
                      opacity: pressed ? 0.4 : 1.0,
                    })}
                    onPress={() =>
                      navigation.navigate('TaskUpdates', { updates })
                    }
                  >
                    <Text style={{ color: 'white', alignSelf: 'center' }}>
                      show all
                    </Text>
                  </Pressable>
                </View>
              ) : null}
              {updates && updates.length === 0 ? (
                <Text style={styles.noUpdates}>
                  There are currently no updates, clock in some progress
                </Text>
              ) : null}
            </>
          )}
        </View>

        <View style={{ marginVertical: 15 }}>
          <View style={{ marginHorizontal: 25 }}>
            <Text style={styles.subheadingText}>Comments</Text>
          </View>
          <View style={{ marginHorizontal: 20 }}>
            <CommentList comments={commentsData} />
            <Pressable
              style={{ marginLeft: 10 }}
              onPress={() => navigation.navigate('Comments', { taskId })}
            >
              <Text style={styles.viewAll}>
                {commentsData?.length !== 0
                  ? 'view all comments'
                  : 'add a comment'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
          {/* <AvatarRow
          users={councilUsers}
          placement={-10 * councilUsers.length}
          additionalUsers={users.length - councilUsers.length}
        /> */}
        </View>
      </ScrollView>
      {isAssignee ? (
        <FAB
          onPress={() => {
            mixpanel?.track('Pressed clock button', {
              Screen: 'Task',
              Assigner: assigner?.id,
              Assignee: assignee?.id,
            });
            navigation.navigate('ClockIn', {
              task: {
                id,
                title,
                description,
                image,
                progress,
                createdBy,
                assignedTo,
                caseId,
              },
            });
          }}
        />
      ) : null}
    </>
  );
}

const styles = EStyleSheet.create({
  headerTitle: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    // marginRight: 50,
  },
  headerEmoji: {
    borderRadius: 10,
    padding: 5,
  },
  headerTitleText: {
    fontFamily: '$boldFont',
    fontSize: 20,
  },
  name: {
    fontFamily: '$boldFont',
    color: '#FFF',
    fontSize: 20,
  },
  titleBanner: {
    backgroundColor: '#5F605F',
    elevation: 5,
    padding: 20,
  },
  titleText: {
    fontFamily: '$boldFont',
    color: '#FFF',
    fontSize: 24,
  },
  sliderTrack: {
    height: 25,
    borderRadius: 10,
    backgroundColor: '#d0d0d0',
    ...ShadowStyle,
  },
  sliderThumb: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: '$grannySmithApple',
  },
  description: {
    marginTop: 15,
    width: '100%',
    fontSize: '$body',
    fontFamily: '$normalFont',
    alignSelf: 'flex-start',
  },
  clock: {
    backgroundColor: '$grannySmithApple',
    padding: 10,
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 15,
    elevation: 10,
  },
  clockText: {
    fontSize: '$heading',
    fontFamily: '$boldFont',
    color: '#FFFFFF',
  },
  councilTitle: {
    fontSize: '$heading',
    fontFamily: '$boldFont',
  },
  noUpdates: {
    fontFamily: '$semiboldFont',
    marginHorizontal: 25,
    color: '#FF3131',
  },
  subheadingText: {
    fontFamily: '$boldFont',
    fontSize: 22,
  },
  viewAll: {
    color: '#898989',
  },
});

export default TaskScreen;
