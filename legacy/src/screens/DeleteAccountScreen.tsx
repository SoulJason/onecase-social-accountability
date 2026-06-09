import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Text, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Button from '../components/Button';

function DeleteAccountScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Are you sure you want to delete your OneCase account? This decision
        cannot be undone.
      </Text>
      <View style={styles.buttons}>
        <Button type='info' style={styles.button} onPress={() => ({})}>
          Yes
        </Button>
        <Button type='light' style={styles.button} onPress={navigation.goBack}>
          No
        </Button>
      </View>
    </View>
  );
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  text: {
    fontFamily: '$normalFont',
    fontSize: 20,
    textAlign: 'center',
  },
  buttons: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    width: '20%',
    borderRadius: 15,
  },
});

export default DeleteAccountScreen;
