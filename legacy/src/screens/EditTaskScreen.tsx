import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useImmer } from 'use-immer';
import {
  Text,
  View,
  TextInput,
  Pressable,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Image from '../components/Image';
import { Avatar, Icon, Button } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import EStyleSheet from 'react-native-extended-stylesheet';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { addTask } from '../lib/supabase/store';

import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp, useHeaderHeight } from '@react-navigation/stack';
import { StackParamList } from '../navigation/SignInStack';
import Modal from '../components/Modal';
import useAddTask from '../mutations/useAddTask';
import useUpdateTask from '../mutations/useUpdateTask';
import Toast from 'react-native-toast-message';
import PressableText from '../components/PressableText';
import ConfirmButton from '../components/ConfirmButton';
import { useMixpanel } from '../providers/MixpanelContext';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'EditTask'>;
  route: RouteProp<StackParamList, 'EditTask'>;
}

function EditTaskScreen({ navigation, route }: Props) {
  const { task, caseItem } = route.params;

  console.log('TASK', task);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [visible, setVisible] = useState(false);
  const secondTextInput = useRef<TextInput>(null);
  const updateTaskMutation = useUpdateTask(
    title,
    description,
    task.id,
    task.caseId
  );
  const mixpanel = useMixpanel();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <PressableText
          type='primary'
          style={{ marginLeft: 15 }}
          textStyle={{ fontSize: 18 }}
          onPress={() => {
            if (title === task.title && description === task.description)
              navigation.goBack();
            else setVisible(true);
          }}
        >
          Cancel
        </PressableText>
      ),
      headerRight: () => (
        <ConfirmButton
          onPress={() => {
            if (title !== '') {
              if (title !== task.title || description !== task.description) {
                mixpanel?.track('Edited task', { 'Task ID': task.id });
                updateTaskMutation.mutate();
              }
              navigation.goBack();
            } else {
              Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Empty Title',
                text2: 'The title cannot be empty!',
                topOffset: 50,
              });
            }
          }}
        />
      ),
    });
  }, [navigation, title, description]);

  const handleTitleChange = (text: string) => {
    setTitle(text);
  };

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
      }}
    >
      <ScrollView>
        <Pressable
          style={{ flex: 1, justifyContent: 'space-between' }}
          onPress={Keyboard.dismiss}
        >
          <View
            style={{
              alignItems: 'center',
              marginTop: 15,
              marginHorizontal: 25,
            }}
          >
            {/* <Avatar
              size='medium'
              rounded
              icon={{
                name: 'user-circle',
                type: 'font-awesome',
                color: 'black',
              }}
              activeOpacity={0.7}
            /> */}
            <Text style={styles.text}>
              Editing task for {caseItem.emoji} {caseItem.title}
            </Text>
            <TextInput
              style={styles.title}
              placeholder='Title the task'
              value={title}
              onChangeText={handleTitleChange}
              onSubmitEditing={() => {
                secondTextInput &&
                  secondTextInput.current &&
                  secondTextInput.current.focus();
              }}
              blurOnSubmit={false}
            />

            {title !== '' || description !== '' ? (
              <TextInput
                style={styles.description}
                multiline={true}
                numberOfLines={5}
                maxLength={1000}
                placeholder='Enter a description... (optional)'
                value={description}
                onChangeText={(text) => setDescription(text)}
                ref={secondTextInput}
              />
            ) : null}
          </View>
        </Pressable>
      </ScrollView>
      <Modal
        visible={visible}
        title='Are you sure you want to leave? Any unsaved changes will be lost.'
        onNo={() => setVisible(false)}
        onYes={() => {
          setVisible(false);
          navigation.goBack();
        }}
        noText='Cancel'
        yesText='Yes'
      />
    </KeyboardAvoidingView>
  );
}

const win = Dimensions.get('window');

const styles = EStyleSheet.create({
  confirm: {
    marginRight: 10,
    color: '#747474',
    fontFamily: '$normalFont',
  },
  text: {
    color: '$textPrimary',
    fontSize: 18,
    fontFamily: '$boldFont',
  },
  title: {
    marginTop: 15,
    width: '100%',
    fontSize: '$heading',
    fontFamily: '$boldFont',
  },
  description: {
    marginTop: 15,
    width: '100%',
    fontSize: '$body',
    fontFamily: '$normalFont',
    textAlignVertical: 'top',
    // maxHeight: 60,
    // backgroundColor: 'white',
  },
  image: {
    width: win.width,
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
  },
  icon: {
    marginHorizontal: 5,
  },
  button: {
    // alignItems: 'center',
    // justifyContent: 'center',
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    elevation: 3,
    marginHorizontal: 3,
  },
  buttonText: {
    fontSize: '$body',
    lineHeight: 21,
    fontFamily: '$boldFont',
    letterSpacing: 0.25,
    color: '#FFFFFF',
  },
});

export default EditTaskScreen;
