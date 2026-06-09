import React, { Fragment } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';
import { Case, Task } from '../../types';
import { ProgressBar } from 'react-native-paper';
import { useUser } from '../../providers/UserContext';
import { Avatar } from 'react-native-elements';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import Popover from 'react-native-popover-view';
import useDeleteTask from '../../mutations/useDeleteTask';
import TaskPopoverButton from '../tasks/TaskPopoverButton';
import RightActions from '../RightActions';
import ShadowStyle from '../../constants/ShadowStyle';
import useAddUpdate from '../../mutations/useAddUpdate';
import { useMixpanel } from '../../providers/MixpanelContext';

interface Props {
  caseItem: Case;
  task: Task;
  navigation: any;
}

const TaskItem = ({ caseItem, task, navigation }: Props) => {
  const { id, title, progress, assigner } = task;
  const { user } = useUser();
  const addUpdateMutation = useAddUpdate(id, progress, 100, 0, 0);
  const deleteTaskMutation = useDeleteTask(id, caseItem.id);
  const mixpanel = useMixpanel();

  const updateTask = () => {
    mixpanel?.track('Clocked in', { Type: 'Completed', 'Task ID': id });
    addUpdateMutation.mutate();
  };

  const deleteTask = () => {
    mixpanel?.track('Deleted task', { 'Task ID': id });
    deleteTaskMutation.mutate();
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation,
    dragX: Animated.AnimatedInterpolation
  ) => {
    return <RightActions updateTask={updateTask} deleteTask={deleteTask} />;
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={styles.taskButton}>
        <View style={{ flex: 1 }}>
          <Pressable
            style={styles.task}
            onPress={() => navigation.navigate('Task', { taskId: id })}
          >
            <Text style={styles.taskText}>{title}</Text>
          </Pressable>
          <View style={{ ...ShadowStyle }}>
            <ProgressBar
              progress={progress}
              color='#96DE90'
              style={{
                marginHorizontal: 10,
                marginBottom: 15,
                height: 10,
                borderRadius: 10,
                elevation: 5,
              }}
            />
          </View>
        </View>
        <View style={{ justifyContent: 'center' }}>
          {user?.id === assigner?.id ? (
            <Pressable
              style={({ pressed }) => [
                styles.clock,
                { opacity: pressed ? 0.4 : 1.0 },
              ]}
              onPress={() => {
                mixpanel?.track('Pressed clock button', {
                  Screen: 'Home',
                  Assigner: assigner?.id,
                  Assignee: assigner?.id,
                });
                navigation.navigate('ClockIn', {
                  task,
                  caseItem,
                });
              }}
            >
              <Text style={{ fontSize: 20 }}>⏰</Text>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.clock,
                { opacity: pressed ? 0.4 : 1.0 },
              ]}
              onPress={() => {
                mixpanel?.track('Pressed clock button', {
                  Screen: 'Home',
                  Assigner: assigner?.id,
                  Assignee: user?.id,
                });
                navigation.navigate('ClockIn', {
                  task,
                  caseItem,
                });
              }}
            >
              <Avatar
                size={25}
                rounded
                source={{ uri: assigner?.avatarUrl }}
                icon={{
                  name: 'user-circle',
                  type: 'font-awesome',
                  color: 'black',
                }}
                activeOpacity={0.7}
              />
            </Pressable>
          )}
        </View>
      </View>
    </Swipeable>
  );
};

const styles = EStyleSheet.create({
  taskButton: {
    backgroundColor: '#5F605F',
    marginVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    marginHorizontal: 15,
    ...ShadowStyle,
  },
  task: {
    flex: 1,
    padding: 10,
  },
  clock: {
    backgroundColor: '$grannySmithApple',
    borderRadius: 999,
    padding: 10,
    margin: 10,
  },
  taskText: {
    fontFamily: '$boldFont',
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default TaskItem;
