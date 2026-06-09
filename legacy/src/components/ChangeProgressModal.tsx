import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import Modal from 'react-native-modal';
import EStyleSheet from 'react-native-extended-stylesheet';
import Button from './Button';

interface Props {
  visible: boolean;
  oldProgress: number;
  newProgress: number;
  onNo?: () => void;
  onYes?: () => void;
}
const ChangeProgressModal = ({
  visible,
  oldProgress,
  newProgress,
  onNo,
  onYes,
}: Props) => {
  return (
    <Modal
      isVisible={visible}
      animationIn='slideInDown'
      animationOut='slideOutRight'
      backdropTransitionOutTiming={0}
    >
      <View style={styles.modal}>
        <Text style={styles.modalTitle}>
          Change progress from{' '}
          <Text style={styles.modalTitleClock}>
            {(oldProgress * 100).toFixed(0)}%
          </Text>{' '}
          to {(newProgress * 100).toFixed(0)}%?
        </Text>
        <Text style={styles.modalContent}>
          You will have to provide an update for what you’ve done
        </Text>
        <View
          style={{
            flexDirection: 'row',

            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Pressable
            style={[styles.modalButton, { backgroundColor: '#9A9A9A' }]}
            onPress={onYes}
          >
            <Text style={styles.modalButtonText}>Yes</Text>
          </Pressable>
          <Pressable
            style={[styles.modalButton, { backgroundColor: '#FF5858' }]}
            onPress={onNo}
          >
            <Text style={styles.modalButtonText}>No</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = EStyleSheet.create({
  modal: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    elevation: 10,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: '$heading',
    fontFamily: '$boldFont',
    marginBottom: 10,
  },
  modalTitleClock: {
    color: '#E56E6E',
  },
  modalTitleUpdate: {
    color: '$ceruleanFrost',
  },
  modalContent: {
    color: '#6D6D6D',
    fontSize: '$body',
    fontFamily: '$normalFont',
    marginVertical: 24,
    textAlign: 'center',
  },
  modalButton: {
    width: 100,
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  modalButtonText: {
    fontFamily: '$normalFont',
    fontSize: '$body',
    color: 'white',
    textAlign: 'center',
  },
});

export default ChangeProgressModal;
