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
import { updateAvatarUrl } from '../../lib/supabase/store';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'ConfirmProfilePicture'>;
  route: RouteProp<StackParamList, 'ConfirmProfilePicture'>;
}

function ConfirmProfilePictureScreen({ navigation, route }: Props) {
  const {
    image: { avatarUrl: originalAvatarUrl, base64Image: originalBase64Image },
  } = route.params;
  const [avatarUrl, setAvatarUrl] = useState(originalAvatarUrl);
  const [base64Image, setBase64Image] = useState(originalBase64Image);

  const changePhoto = async () => {
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
  const next = async () => {
    await updateAvatarUrl(base64Image);
    navigation.navigate('Welcome');
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
          {avatarUrl !== '' ? (
            <Image source={{ uri: avatarUrl }} style={styles.image} />
          ) : (
            <View style={styles.placeholder} />
          )}
          <Text style={styles.prompt}>Profile Picture Added</Text>
          <PressableText onPress={changePhoto}>Change photo</PressableText>
        </View>
      </View>
      <View style={styles.bottom}>
        <Button type='info' onPress={next}>
          Next
        </Button>
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
    marginTop: 15,
    marginBottom: 20,
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

export default ConfirmProfilePictureScreen;
