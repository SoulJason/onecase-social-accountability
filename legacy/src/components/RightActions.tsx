import React, { Fragment, useState } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';
import { Ionicons } from '@expo/vector-icons';
import Popover from 'react-native-popover-view';

import TaskPopoverButton from './tasks/TaskPopoverButton';

interface Props {
  updateTask: () => void;
  deleteTask: () => void;
}
const RightActions = ({ updateTask, deleteTask }: Props) => {
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  interface ActionButton {
    icon: React.ReactNode;
    action: () => void;
    text: string;
  }
  interface PopoverActionsProps {
    buttons: ActionButton[];
  }
  const PopoverActions = ({ buttons }: PopoverActionsProps) => {
    return (
      <>
        {buttons.map(({ icon, action, text }: ActionButton, i) => {
          return (
            <Fragment key={i}>
              <Pressable
                style={({ pressed }) => [
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 10,
                    opacity: pressed ? 0.4 : 1.0,
                  },
                ]}
                onPress={action}
              >
                {icon}
                <Text style={styles.popoverActionButtonText}>{text}</Text>
              </Pressable>
              {i !== buttons.length - 1 ? (
                <View
                  style={{
                    height: 1,
                    backgroundColor: '#929292',
                    marginHorizontal: 8,
                  }}
                />
              ) : null}
            </Fragment>
          );
        })}
      </>
    );
  };

  return (
    <View style={{ marginLeft: 12, flexDirection: 'row-reverse' }}>
      {/* <Popover
        popoverStyle={styles.popover}
        arrowStyle={styles.popoverArrow}
        verticalOffset={-30}
        from={
          <Pressable
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.4 : 1.0,
                backgroundColor: '#939393',
                justifyContent: 'center',
                alignItems: 'center',
                height: 50,
                width: 50,
                alignSelf: 'center',
                marginRight: 2,
                borderRadius: 10,
              },
            ]}
          >
            <Ionicons name='ellipsis-horizontal' size={24} color='white' />
          </Pressable>
        }
      >
        <PopoverActions
          buttons={[
            {
              icon: <Ionicons name='pencil-sharp' size={24} color='#CDD1F8' />,
              action: () => ({}),
              text: 'Edit Task',
            },
            {
              icon: <Ionicons name='share-outline' size={24} color='#CDD1F8' />,
              action: () => ({}),
              text: 'Share',
            },
          ]}
        />
      </Popover> */}
      <TaskPopoverButton
        backgroundColor='#BDFF00'
        iconName='checkmark-outline'
        prompt='Mark the task as complete?'
        buttonColor='#4DF15D'
        buttonText='Complete Task'
        onButtonPress={() => setIsButtonPressed(true)}
        onOpenStart={() => {
          setIsButtonPressed(false);
        }}
        onCloseComplete={async () => {
          if (isButtonPressed) {
            setIsButtonPressed(false);
            await updateTask();
          }
        }}
      />
      <TaskPopoverButton
        backgroundColor='#FF0000'
        iconName='trash-outline'
        prompt='Delete the task permanently?'
        buttonColor='#F14D4D'
        buttonText='Delete Task'
        onButtonPress={() => setIsButtonPressed(true)}
        onOpenStart={() => {
          setIsButtonPressed(false);
        }}
        onCloseComplete={async () => {
          if (isButtonPressed) {
            setIsButtonPressed(false);
            await deleteTask();
          }
        }}
      />
    </View>
  );
};

const styles = EStyleSheet.create({
  popover: {
    backgroundColor: '#53575F',
    borderRadius: 7,
  },
  popoverArrow: { backgroundColor: 'transparent' },
  popoverPrompt: {
    color: '#FFFFFF',
    fontFamily: '$normalFont',
    padding: 10,
  },
  popoverButton: {
    alignItems: 'center',
    padding: 10,
  },
  popoverButtonText: {
    fontFamily: '$boldFont',
  },
  popoverActionButtonText: {
    marginLeft: 5,
    fontFamily: '$normalFont',
    color: '#FFFFFF',
  },
});

export default RightActions;
