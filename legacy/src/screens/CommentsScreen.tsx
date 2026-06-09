import React, { createRef, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  TextInput,
  View,
} from 'react-native';

import { StackParamList } from '../navigation/SignInStack';
import { StackNavigationProp, useHeaderHeight } from '@react-navigation/stack';
import { Comment } from '../types';
import EStyleSheet from 'react-native-extended-stylesheet';
import useCommentsByTaskId from '../queries/useCommentsByTaskId';
import { RouteProp } from '@react-navigation/native';
import CommentItem from '../components/tasks/CommentItem';
import { useUser } from '../providers/UserContext';
import { Avatar } from 'react-native-elements';
import PressableText from '../components/PressableText';
import DismissKeyboardView from '../components/DismissKeyboardView';
import useAddTaskComment from '../mutations/useAddTaskComment';
import CommentList from '../components/tasks/CommentList';
import { useMixpanel } from '../providers/MixpanelContext';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Comments'>;
  route: RouteProp<StackParamList, 'Comments'>;
}

function CommentsScreen({ navigation, route }: Props) {
  const { taskId } = route.params;
  const {
    data: comments,
    isLoading,
    isError,
    refetch,
  } = useCommentsByTaskId(taskId);
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [newCommentPosted, setNewCommentPosted] = useState(false);
  const addCommentMutation = useAddTaskComment(taskId, message);
  const headerHeight = useHeaderHeight();
  const scrollViewRef = useRef<ScrollView>(null);
  const mixpanel = useMixpanel();

  const refresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleChangeText = async (text: string) => {
    setMessage(text);
  };

  const handlePost = async () => {
    if (message !== '') {
      addCommentMutation.mutate();
      mixpanel?.track('Commented', { 'Task ID': taskId });
      setNewCommentPosted(true);
      setMessage('');
      Keyboard.dismiss();
    }
  };

  if (isLoading) {
    return null;
  }
  if (isError) {
    return null;
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() => {
          if (newCommentPosted) {
            setNewCommentPosted(false);
            if (scrollViewRef.current) {
              scrollViewRef.current.scrollToEnd({ animated: true });
            }
          }
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        <DismissKeyboardView>
          <CommentList comments={comments} />
        </DismissKeyboardView>
      </ScrollView>

      <KeyboardAvoidingView
        style={styles.inputContainer}
        behavior={Platform.select({ android: undefined, ios: 'padding' })}
        keyboardVerticalOffset={Platform.select({
          ios: headerHeight,
        })}
      >
        <View style={styles.container}>
          <Avatar
            size='small'
            rounded
            source={{ uri: user?.avatarUrl }}
            icon={{
              name: 'user-circle',
              type: 'font-awesome',
              color: 'black',
            }}
            activeOpacity={0.7}
          />
          <View style={styles.textInputContainer}>
            <TextInput
              placeholder='Add a comment...'
              style={styles.textInput}
              onChangeText={handleChangeText}
              value={message}
            />
            <PressableText style={{ color: '#21A8E1' }} onPress={handlePost}>
              post
            </PressableText>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = EStyleSheet.create({
  inputContainer: {
    backgroundColor: '#5F605F',
    // height: 60,
    // flexDirection: 'row',
    // alignItems: 'center',
    // paddingVertical: 10,
    // paddingHorizontal: 15,
  },
  container: {
    backgroundColor: '#5F605F',
    // height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  textInputContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginLeft: 10,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    marginRight: 5,
  },
});

export default CommentsScreen;
