import React from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';

const settings: Setting[] = [
  {
    label: 'Terms of Service',
    icon: <Ionicons name='md-document-text-sharp' size={30} color='black' />,
    onPress() {
      Linking.openURL(
        'https://powerful-snarl-ae3.notion.site/Onecase-Terms-of-Service-0efcafae6cec4124a6c8552eb49d6a78/'
      );
    },
  },
  {
    label: 'Privacy Policy',
    icon: <MaterialCommunityIcons name='shield-lock' size={30} color='black' />,
    onPress() {
      Linking.openURL(
        'https://powerful-snarl-ae3.notion.site/OneCase-Privacy-Policy-95086e7605364f719b08ed0a888074a5'
      );
    },
  },
  {
    label: `App Version: ${Constants.manifest.version}`,
    icon: <Ionicons name='ios-information-circle' size={30} color='black' />,
    onPress() {
      Toast.show({
        type: 'success',
        text1: 'Copied to clipboard!',
      });
      Clipboard.default.setString(`${Constants.manifest.version}`);
    },
  },
  // {
  //   label: 'Reset Password',
  //   icon: (
  //     <MaterialCommunityIcons
  //       name='form-textbox-password'
  //       size={24}
  //       color='black'
  //     />
  //   ),
  //   onPress() {
  //     Linking.openURL(
  //       'https://powerful-snarl-ae3.notion.site/OneCase-Privacy-Policy-95086e7605364f719b08ed0a888074a5'
  //     );
  //   },
  // },
];

interface Setting {
  label: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  textStyle?: any;
}
const Setting = ({ label, icon, onPress, textStyle }: Setting) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        opacity: pressed ? 0.4 : 1.0,
      })}
    >
      {icon}
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </Pressable>
  );
};
const SettingsScreen = () => {
  const navigation = useNavigation();

  return (
    <>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={{ marginTop: 50 }}>
          {settings.map((setting, i) => (
            <Setting key={i} {...setting} />
          ))}
        </View>
      </View>
      {/* <View style={{ marginBottom: 25 }}>
        <Setting
          textStyle={styles.deleteText}
          label='Delete Account'
          onPress={() => navigation.navigate('DeleteAccount')}
        />
      </View> */}
    </>
  );
};

const styles = EStyleSheet.create({
  text: {
    fontFamily: '$normalFont',
    fontSize: 20,
    marginLeft: 10,
  },
  deleteText: {
    color: '#FF2323',
  },
});
export default SettingsScreen;
