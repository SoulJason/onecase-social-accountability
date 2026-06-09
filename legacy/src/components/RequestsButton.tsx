import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Entypo, Ionicons } from '@expo/vector-icons';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Badge } from 'react-native-elements';

interface Props {
  numRequests: number;
  onPress?: () => void;
}
const RequestsButton = ({ numRequests, onPress }: Props) => {
  return (
    <View style={styles.border}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          {
            opacity: pressed ? 0.4 : 1.0,
          },
        ]}
      >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <Badge
            value={numRequests}
            badgeStyle={[
              styles.badge,
              {
                backgroundColor: numRequests !== 0 ? '#FF0000' : 'transparent',
              },
            ]}
            textStyle={{ color: numRequests !== 0 ? '#FFF' : '#000' }}
          />
          <Text style={styles.text}>Requests</Text>
        </View>
        <View style={styles.rightSide}>
          {numRequests !== 0 ? (
            <Entypo name='dot-single' size={24} color='#2F60E0' />
          ) : null}
          <Ionicons name='chevron-forward-outline' size={24} color='#A6A4A1' />
        </View>
      </Pressable>
    </View>
  );
};

const styles = EStyleSheet.create({
  border: {
    borderBottomColor: '#C4C4C4',
    borderBottomWidth: 1,
  },
  button: {
    flexDirection: 'row',
    padding: 10,
  },
  badge: {
    backgroundColor: '#FF0000',
  },
  text: {
    fontFamily: '$semiboldFont',
    marginLeft: 5,
  },
  rightSide: {
    flexDirection: 'row',
  },
});

export default RequestsButton;
