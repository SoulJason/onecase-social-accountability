import React, { useState, useRef } from 'react';
import { View, Text, Image, Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Button from '../../components/Button';
import * as ImagePicker from 'expo-image-picker';

import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { Input } from 'react-native-elements';
// import { useStateValue } from './store/StateProvider';
// import { ActionType } from './store/actions';
import { StackParamList } from '../../navigation/OnboardStack';
import CreateProfileTemplate from '../../components/CreateProfileTemplate';
import PressableText from '../../components/PressableText';
import Toast from 'react-native-toast-message';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'ProfilePicture'>;
  route: RouteProp<StackParamList, 'ProfilePicture'>;
}

function ProfilePictureScreen({ navigation }: Props) {
  const [avatarUrl, setAvatarUrl] = useState('');

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
          navigation.navigate('ConfirmProfilePicture', {
            image: {
              avatarUrl: result.uri,
              base64Image: result.base64,
            },
          });
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
    <CreateProfileTemplate>
      <View style={styles.main}>
        <View
          style={{
            marginBottom: 40,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={styles.prompt}>Add Profile Picture</Text>
          {avatarUrl !== '' ? (
            <Image source={{ uri: avatarUrl }} style={styles.image} />
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>
      </View>
      <View style={styles.bottom}>
        <Button type='info' onPress={pickImage}>
          Add a Photo
        </Button>
        <PressableText
          style={styles.skip}
          onPress={() => navigation.navigate('Welcome')}
        >
          Skip
        </PressableText>
      </View>
    </CreateProfileTemplate>
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
  skip: {
    marginTop: 10,
  },
});

export default ProfilePictureScreen;
