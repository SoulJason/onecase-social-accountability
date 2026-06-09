import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
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
import { Avatar } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import EStyleSheet from 'react-native-extended-stylesheet';
import { ScrollView } from 'react-native-gesture-handler';
import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp, useHeaderHeight } from '@react-navigation/stack';
import { StackParamList } from '../navigation/SignInStack';
import Modal from '../components/Modal';
import useAddTask from '../mutations/useAddTask';
import Toast from 'react-native-toast-message';
import { useUser } from '../providers/UserContext';
import ConfirmButton from '../components/ConfirmButton';
import PressableText from '../components/PressableText';
import { useMixpanel } from '../providers/MixpanelContext';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'CreateTask'>;
  route: RouteProp<StackParamList, 'CreateTask'>;
}

function CreateTaskScreen({ navigation, route }: Props) {
  const { caseItem } = route.params;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imageDim, setImageDim] = useState<[number, number]>([0, 0]);
  const [visible, setVisible] = useState(false);
  const [action, setAction] = useState<any>(null);
  const [created, setCreated] = useState(false);
  const secondTextInput = useRef<TextInput>(null);
  const addTaskMutation = useAddTask(title, description, caseItem.id);
  const { user } = useUser();
  const mixpanel = useMixpanel();

  const headerHeight = useHeaderHeight();

  const confirmLeave = (e: any) => {
    setAction(e.data.action);
    if (
      e.data.action.type === 'REPLACE' ||
      title === '' ||
      (title === '' && description === '')
    ) {
      return;
    }
    // Prevent default behavior of leaving the screen
    e.preventDefault();
    setVisible(true);
  };

  useEffect(() => {
    navigation.addListener('beforeRemove', confirmLeave);
    return () => {
      navigation.removeListener('beforeRemove', confirmLeave);
    };
  }, [title, description]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <PressableText
          type='primary'
          style={{ marginLeft: 15 }}
          textStyle={{ fontSize: 18 }}
          onPress={() => {
            navigation.goBack();
          }}
        >
          Cancel
        </PressableText>
      ),
      headerRight: () => (
        <ConfirmButton
          onPress={async () => {
            if (title !== '') {
              const newTask = await addTaskMutation.mutateAsync();
              mixpanel?.track('Created task', {
                'Task ID': newTask.id,
                'Case ID': caseItem.id,
              });
              navigation.replace('HomeTab');
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
                value={description}
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

      <KeyboardAvoidingView
        behavior={Platform.select({ android: undefined, ios: 'padding' })}
        keyboardVerticalOffset={Platform.select({
          ios: headerHeight,
        })}
      >
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
            // onPress={() => navigation.navigate('SelectCase')}
          >
            <Text style={styles.buttonText}>{caseItem.title}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      <Modal
        visible={visible}
        title='Are you sure you want to leave? Your information will be lost.'
        onNo={() => setVisible(false)}
        onYes={() => {
          setVisible(false);
          navigation.dispatch(action);
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
    fontSize: 18,
    // lineHeight: 21,
    fontFamily: '$boldFont',
    letterSpacing: 0.25,
    color: '#FFFFFF',
  },
});

export default CreateTaskScreen;
