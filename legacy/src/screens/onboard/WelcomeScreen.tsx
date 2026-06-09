import React, { useState, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Button from '../../components/Button';

import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
// import { useStateValue } from './store/StateProvider';
// import { ActionType } from './store/actions';
import { StackParamList } from '../../navigation/OnboardStack';
import CreateProfileTemplate from '../../components/CreateProfileTemplate';
import { useUser } from '../../providers/UserContext';
import { finishOnboarding } from '../../lib/supabase/store';
import useCurrentUser from '../../queries/useCurrentUser';
import TextInput from '../../components/TextInput';
import emojiRegex from 'emoji-regex';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import useAddCase from '../../mutations/useAddCase';
import Toast from 'react-native-toast-message';
import TabColors from '../../constants/TabColors';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Welcome'>;
  route: RouteProp<StackParamList, 'Welcome'>;
}

function WelcomeScreen({ navigation }: Props) {
  const { data: user } = useCurrentUser();
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('');
  const addCaseMutation = useAddCase();

  const next = async () => {
    let isValid = true;
    if (title === '') {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'No title entered',
        text2: 'Enter a title!',
        topOffset: 50,
      });
      isValid = false;
    } else if (emoji === '') {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'No emoji selected',
        text2: 'Select an emoji!',
        topOffset: 50,
      });
      isValid = false;
    } else if (title === 'Assigned Tasks') {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'You cannot use that title!',
        text2: 'Choose a different title',
        topOffset: 50,
      });
      isValid = false;
    }
    if (!isValid) {
      return;
    }
    const index = 1;
    addCaseMutation.mutate({
      index,
      title,
      emoji,
      color: TabColors[index],
      users: [],
    });
    await finishOnboarding();
    navigation.navigate('HomeTab');
  };

  const handleEmojiSelect = (text: string) => {
    const regex = emojiRegex();
    const emojiText = text.match(regex);
    if (emojiText && emojiText.length == 2) {
      setEmoji(emojiText[1]);
    } else if (emojiText === null || emojiText.length < 1) {
      setEmoji('');
    } else if (emojiText && emojiText.length === 1) {
      setEmoji(emojiText.slice(0, 1)[0]);
    }
  };

  return (
    <KeyboardAwareScrollView style={{ flex: 1, marginHorizontal: 30 }}>
      <View style={styles.main}>
        <View style={{ marginBottom: 40 }}>
          <Text style={styles.prompt}>Welcome to the club</Text>
          <Text style={styles.name}>{user?.firstName}</Text>
          <Text style={styles.emojis}>🎉{'  '}🥳</Text>
          <Text style={styles.description}>
            Before we begin, what's something you want to start doing more
            often? Name a topic.
          </Text>
          <TextInput
            style={styles.input}
            placeholder='Swimming, Homework, etc.'
            value={title}
            onChangeText={(text) => setTitle(text)}
          />
          <View style={styles.emojiContainer}>
            <Text style={styles.emojiDescription}>
              select an emoji for it xD
            </Text>
            <TextInput
              style={styles.emojiButton}
              value={emoji}
              onChangeText={handleEmojiSelect}
              autoCompleteType='off'
              caretHidden={true}
              selectTextOnFocus={false}
              underlineColorAndroid='transparent'
            />
          </View>
        </View>
      </View>
      <View style={styles.bottom}>
        <Button type='info' onPress={next}>
          Continue
        </Button>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 30,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    // alignItems: 'center',
  },
  bottom: {
    justifyContent: 'center',
    marginBottom: 40,
    alignItems: 'center',
    marginHorizontal: 30,
  },
  prompt: {
    fontSize: 25,
    fontFamily: '$normalFont',
    textAlign: 'center',
  },
  name: {
    fontSize: 25,
    fontFamily: '$boldFont',
    textAlign: 'center',
    marginBottom: 10,
  },
  emojis: {
    fontSize: 56,
    color: 'black',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    color: '#3C3C3C',
    fontFamily: '$semiboldFont',
    textAlign: 'center',
    fontSize: 17,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FF8963',
    color: 'white',
    fontFamily: '$boldFont',
    fontSize: 22,
    // width: '95%',
    marginBottom: 30,
  },
  emojiContainer: {
    alignItems: 'center',
  },
  emojiDescription: {
    fontSize: 17,
    fontFamily: '$semiboldFont',
    marginBottom: 10,
  },
  emojiButton: {
    width: 64,
    height: 64,
    backgroundColor: 'white',
    elevation: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: 32,
    marginTop: 5,
  },
});

export default WelcomeScreen;
