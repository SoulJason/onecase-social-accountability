import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { CouncilUpdate, LiveUpdate } from '../../types';
import fromNow from '../../utils/fromNow';
import ProgressBar from '../ProgressBar';
import { Avatar } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { sendPushNotification } from '../../lib/supabase/store';
import { useUser } from '../../providers/UserContext';
import Toast from 'react-native-toast-message';
import ShadowStyle from '../../constants/ShadowStyle';
import secondsToTimeString from '../../utils/secondsToTimeString';
import UpdateTitle from '../UpdateTitle';
import BlinkView from '../BlinkView';
import { useMixpanel } from '../../providers/MixpanelContext';

interface Props {
  updates: Array<LiveUpdate | CouncilUpdate>;
  refetch: () => void;
}

const CouncilUpdateList = ({ updates, refetch }: Props) => {
  const navigation = useNavigation();
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const mixpanel = useMixpanel();

  const refresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

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

  const renderCouncilUpdate = ({
    item,
  }: {
    item: LiveUpdate | CouncilUpdate;
  }) => {
    console.log('Item', item);
    if ('isLive' in item) {
      return (
        <View style={styles.updateItem}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row' }}>
              <Avatar
                size='medium'
                rounded
                source={{ uri: item.avatarUrl }}
                icon={{
                  name: 'user-circle',
                  type: 'font-awesome',
                  color: 'black',
                }}
                onPress={() =>
                  navigation.navigate('UserProfile', { userId: item.userId })
                }
                activeOpacity={0.7}
              />
              <View style={styles.text}>
                <Text
                  style={styles.nameText}
                  onPress={() =>
                    navigation.navigate('UserProfile', { userId: item.userId })
                  }
                >
                  {item.firstName} {item.lastName}
                </Text>
                <Text style={styles.usernameText}>{item.username}</Text>
              </View>
            </View>
            <View>
              <Text
                style={{
                  fontFamily: 'open-sans-bold',
                  fontSize: 18,
                  textAlign: 'right',
                }}
              >
                {fromNow(item.createdAt, true)}
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <BlinkView style={{ justifyContent: 'center', marginRight: 5 }}>
                  <View style={styles.live} />
                </BlinkView>
                <Text
                  style={{
                    color: '#43A4EB',
                    fontFamily: 'open-sans-bold',
                    fontSize: 16,
                  }}
                >
                  live
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.taskButton}>
            <View style={{ flex: 1 }}>
              <Pressable
                style={styles.task}
                onPress={() =>
                  navigation.navigate('Task', { taskId: item.taskId })
                }
              >
                <Text style={styles.taskText}>{item.taskTitle}</Text>
              </Pressable>
              <View style={styles.progressBarContainer}>
                <View style={{ width: '100%', ...ShadowStyle }}>
                  <ProgressBar
                    oldProgress={item.taskProgress}
                    newProgress={item.taskProgress}
                    style={{ height: 12, elevation: 5, borderRadius: 10 }}
                  />
                </View>
              </View>
            </View>
            <View style={{ justifyContent: 'center' }}>
              <Pressable
                onPress={() =>
                  handleWave(
                    item.pushToken,
                    item.userId,
                    item.taskId,
                    item.taskTitle
                  )
                }
                style={({ pressed }) => [
                  styles.wave,
                  { opacity: pressed ? 0.4 : 1.0 },
                ]}
              >
                <Text style={{ fontSize: 25 }}>👋</Text>
              </Pressable>
            </View>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.updateItem}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row' }}>
            <Avatar
              size='medium'
              rounded
              source={{ uri: item.avatarUrl }}
              icon={{
                name: 'user-circle',
                type: 'font-awesome',
                color: 'black',
              }}
              onPress={() =>
                navigation.navigate('UserProfile', { userId: item.userId })
              }
              activeOpacity={0.7}
            />
            <View style={styles.text}>
              <Text
                style={styles.nameText}
                onPress={() =>
                  navigation.navigate('UserProfile', { userId: item.userId })
                }
              >
                {item.firstName} {item.lastName}
              </Text>
              <Text style={styles.usernameText}>{item.username}</Text>
            </View>
          </View>
          <View>
            <Text
              style={{
                fontFamily: 'open-sans-bold',
                fontSize: 18,
                textAlign: 'right',
              }}
            >
              {fromNow(item.createdAt, true)}
            </Text>
            <UpdateTitle
              timeSpent={item.timeSpent}
              totalTime={item.totalTime}
              textStyle={{
                textAlign: 'right',
              }}
            />
          </View>
        </View>
        <View style={styles.taskButton}>
          <View style={{ flex: 1 }}>
            <Pressable
              style={styles.task}
              onPress={() =>
                navigation.navigate('Task', { taskId: item.taskId })
              }
            >
              <Text style={styles.taskText}>{item.taskTitle}</Text>
            </Pressable>
            <View style={styles.progressBarContainer}>
              <View style={{ width: '100%', ...ShadowStyle }}>
                <ProgressBar
                  oldProgress={item.oldProgress}
                  newProgress={item.newProgress}
                  style={{ height: 12, elevation: 5, borderRadius: 10 }}
                />
              </View>
            </View>
          </View>
          <View style={{ justifyContent: 'center' }}>
            <Pressable
              onPress={() =>
                handleWave(
                  item.pushToken,
                  item.userId,
                  item.taskId,
                  item.taskTitle
                )
              }
              style={({ pressed }) => [
                styles.wave,
                { opacity: pressed ? 0.4 : 1.0 },
              ]}
            >
              <Text style={{ fontSize: 25 }}>👋</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={updates}
      renderItem={renderCouncilUpdate}
      keyExtractor={(item) => {
        if ('isLive' in item) {
          return `${item.clockInId}`;
        }
        return `${item.updateId}`;
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
      }
    />
  );
};

const styles = EStyleSheet.create({
  updateItem: {
    marginVertical: 7,
    paddingHorizontal: 15,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
  },
  text: {
    marginLeft: 10,
  },
  nameText: {
    color: '#323232',
    fontFamily: '$boldFont',
    fontSize: 18,
  },
  usernameText: {
    color: '#9E9E9E',
    fontSize: 18,
  },
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
  wave: {
    backgroundColor: '#7189FF',
    borderRadius: 999,
    padding: 10,
    margin: 10,
  },
  taskText: {
    fontFamily: '$boldFont',
    color: '#FFFFFF',
    fontSize: 16,
  },
  live: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: 'red',
  },
});

export default CouncilUpdateList;
