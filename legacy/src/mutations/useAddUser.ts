import { Platform } from 'react-native';
import { useMutation, useQueryClient } from 'react-query';
import supabase from '../lib/supabase';
import { IState } from '../screens/create-account/store/StateProvider';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

const addUser = async (userId: string, user: IState) => {
  const { firstName, lastName, username, phone, email } = user;

  let token = null;
  if (Constants.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus === 'granted') {
      token = (
        await Notifications.getExpoPushTokenAsync({
          experienceId: '@lawlin/onecase',
        })
      ).data;
    }
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }
  const { data, error, status, statusText, body } = await supabase
    .from('users')
    .update({
      first_name: firstName,
      last_name: lastName,
      username,
      push_token: token,
    })
    .eq('id', userId);
  return data;
};

export default function useAddUser(userState: IState) {
  const queryClient = useQueryClient();
  const user = supabase.auth.user();

  console.log('ADDING USER NOW, USER STATE:', userState);
  return useMutation(() => addUser(user?.id ?? '', userState), {
    onSuccess: () => {
      queryClient.refetchQueries('user');
    },
  });
}
