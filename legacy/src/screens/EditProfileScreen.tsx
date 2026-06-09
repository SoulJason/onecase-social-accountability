import React, { useState, useLayoutEffect } from 'react';
import { View, Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import * as ImagePicker from 'expo-image-picker';
import { Avatar, Button as RNEButton } from 'react-native-elements';

import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp, useHeaderHeight } from '@react-navigation/stack';
import { Input } from 'react-native-elements';

import Toast from 'react-native-toast-message';
import PressableText from '../components/PressableText';
import { StackParamList } from '../navigation/SignInStack';
import useUpdateUser from '../mutations/useUpdateUser';
import useCurrentUser from '../queries/useCurrentUser';
import DismissKeyboardView from '../components/DismissKeyboardView';
import useKeyboard from '../hooks/useKeyboard';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'EditProfile'>;
  route: RouteProp<StackParamList, 'EditProfile'>;
}

function EditProfileScreen({ navigation }: Props) {
  const { data: user } = useCurrentUser();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [base64Image, setBase64Image] = useState('');

  const updateUserMutation = useUpdateUser(
    firstName,
    lastName,
    username,
    base64Image
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <RNEButton
          title='Confirm'
          type='clear'
          titleStyle={styles.next}
          onPress={() => {
            updateUserMutation.mutate();
            navigation.goBack();
          }}
        />
      ),
    });
  }, [navigation]);

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status === 'granted') {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 4],
          base64: true,
        });

        if (!result.cancelled && result.base64) {
          setAvatarUrl(result.uri);
          setBase64Image(result.base64);
        }
      } else {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Failed to give access!',
          text2: 'Please allow camera access to add a profile picture',
          topOffset: 50,
        });
      }
    }
  };

  return (
    <DismissKeyboardView>
      <KeyboardAwareScrollView>
        <View style={styles.main}>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {avatarUrl !== '' ? (
              <Avatar
                size='xlarge'
                rounded
                source={{ uri: avatarUrl }}
                icon={{
                  name: 'user-circle',
                  type: 'font-awesome',
                  color: 'black',
                }}
              />
            ) : (
              <Avatar
                size='xlarge'
                rounded
                icon={{
                  name: 'user-circle',
                  type: 'font-awesome',
                  color: 'black',
                }}
              />
            )}
            <PressableText onPress={pickImage} style={{ marginTop: 20 }}>
              Change Profile Picture
            </PressableText>
          </View>
          <View style={{ marginTop: 20, paddingHorizontal: 30 }}>
            <Input
              label='First Name'
              value={firstName}
              onChangeText={setFirstName}
            />
            <Input
              label='Last Name'
              value={lastName}
              onChangeText={setLastName}
            />
            <Input
              label='Username'
              value={username}
              onChangeText={setUsername}
            />
          </View>
        </View>
        <View style={styles.bottom}></View>
      </KeyboardAwareScrollView>
    </DismissKeyboardView>
  );
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 30,
  },
  main: {
    marginTop: 10,
    justifyContent: 'center',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 999,
  },
  placeholder: {
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: '#7189FF',
  },
  bottom: {
    justifyContent: 'center',
    marginBottom: 40,
    alignItems: 'center',
    marginHorizontal: 30,
  },
  prompt: {
    fontSize: '$heading',
    fontFamily: '$normalFont',
    marginBottom: 50,
    textAlign: 'center',
  },
  inputContainer: {
    borderRadius: 10,
    width: '85%',
    marginBottom: 20,
  },
  input: {
    borderRadius: 10,
    backgroundColor: '#F8F9F9',
    width: '95%',
  },
});

export default EditProfileScreen;
