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
} from 'react-native';
import Image from '../components/Image';
import { Avatar, Icon } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import EStyleSheet from 'react-native-extended-stylesheet';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { addTask, sendPushNotification } from '../lib/supabase/store';

import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParamList } from '../navigation/SignInStack';
import Modal from '../components/Modal';
import useAssignTask from '../mutations/useAssignTask';
import { useUser } from '../providers/UserContext';
import { Case } from '../types';
import Toast from 'react-native-toast-message';
import Button from '../components/Button';
import ShadowStyle from '../constants/ShadowStyle';
import ConfirmButton from '../components/ConfirmButton';
import PressableText from '../components/PressableText';
import { useMixpanel } from '../providers/MixpanelContext';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'AssignTask'>;
  route: RouteProp<StackParamList, 'AssignTask'>;
}

function AssignTaskScreen({ navigation, route }: Props) {
  const { assignee, caseItem, cases } = route.params;

  const { user } = useUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imageDim, setImageDim] = useState<[number, number]>([0, 0]);
  const [visible, setVisible] = useState(false);
  const secondTextInput = useRef<TextInput>(null);
  const assignTaskMutation = useAssignTask(
    user?.id ?? '',
    null,
    title,
    description,
    caseItem.id
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
            if (title === '' && description === '') navigation.goBack();
            else setVisible(true);
          }}
        >
          Cancel
        </PressableText>
        // <Button
        //   icon={<Ionicons name='chevron-back' size={24} color='black' />}
        //   type='info'
        //   titleStyle={styles.cancel}

        // >
        //   Cancel
        // </Button>
      ),
      headerRight: () => (
        <ConfirmButton
          onPress={async () => {
            if (title !== '') {
              mixpanel?.track('Assigned task');
              const data = await assignTaskMutation.mutateAsync();
              if (data && data.length > 0) {
                await sendPushNotification(
                  assignee.pushToken ?? '',
                  assignee.id,
                  'assign_task',
                  'New Task Proposed',
                  `${user?.firstName} proposed you a new task!`,
                  null,
                  null,
                  data[0].id
                );
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
  }, [navigation, title, description, image, imageDim]);

  const handleTitleChange = (text: string) => {
    setTitle(text);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      // mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImageDim([result.width, result.height]);
      setImage(result.uri);
    }
  };

  const handleImagePress = async () => {
    let { status } = await ImagePicker.getCameraPermissionsAsync();
    if (status === 'granted') {
      pickImage();
    } else {
      let { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status === 'granted') {
        pickImage();
      } else {
        alert('Sorry, we need camera roll permissions!');
      }
    }
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
            <Avatar
              size='medium'
              rounded
              source={{ uri: user?.avatarUrl }}
              icon={{
                name: 'user-circle',
                type: 'font-awesome',
                color: 'black',
              }}
              activeOpacity={0.7}
            />
            <Text style={styles.text}>Creating task for</Text>
            <Text style={styles.text}>{caseItem.emoji}</Text>
            <TextInput
              style={styles.title}
              placeholder='Title the task'
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
                onChangeText={(text) => setDescription(text)}
                ref={secondTextInput}
              />
            ) : null}

            {image !== '' ? (
              <Image uri={image} dimensions={imageDim} margin={50} />
            ) : null}
          </View>
        </Pressable>
      </ScrollView>

      <View style={styles.bottomBar}>
        {/* <View style={styles.icon}>
          <Icon
            name='ios-image-outline'
            type='ionicon'
            onPress={handleImagePress}
          />
        </View> */}
        <Pressable
          style={[styles.button, { backgroundColor: caseItem.color }]}
          onPress={() =>
            navigation.navigate('AssignTaskSelectCase', { assignee, cases })
          }
        >
          <Text style={styles.buttonText}>{caseItem.title}</Text>
        </Pressable>
      </View>
      <Modal
        visible={visible}
        title='Are you sure you want to leave? Your information will be lost.'
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
    fontSize: 20,
    fontFamily: '$boldFont',
    marginTop: 5,
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

export default AssignTaskScreen;
