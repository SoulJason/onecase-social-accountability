import React from 'react';
import { Text, View } from 'react-native';
import Image from '../components/Image';
import { RouteProp } from '@react-navigation/core';
import { StackParamList } from '../navigation/SignInStack';
import EStyleSheet from 'react-native-extended-stylesheet';

interface Props {
  route: RouteProp<StackParamList, 'PreviewTask'>;
}

function PreviewTaskScreen({ route }: Props) {
  const { title, description, image, imageDim } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.titleBanner}>
        <Text style={styles.titleText}>{title}</Text>
      </View>
      <View
        style={{ alignItems: 'center', marginTop: 15, marginHorizontal: 25 }}
      >
        <Text style={styles.description}>{description}</Text>
        {image !== '' && (
          <Image uri={image} dimensions={imageDim} margin={50} />
        )}
      </View>
    </View>
  );
}

const styles = EStyleSheet.create({
  titleBanner: {
    backgroundColor: '$ceruleanFrost',
    elevation: 5,
  },
  titleText: {
    padding: 10,
    color: '#FFFFFF',
    fontFamily: '$boldFont',
    fontSize: '$heading',
  },
  description: {
    marginTop: 15,
    width: '100%',
    fontSize: '$body',
    fontFamily: '$normalFont',
    alignSelf: 'flex-start',
  },
});

export default PreviewTaskScreen;
