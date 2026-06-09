import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import RNModal from 'react-native-modal';
import EStyleSheet from 'react-native-extended-stylesheet';
import Button from './Button';
import ShadowStyle from '../constants/ShadowStyle';

interface Props {
  visible: boolean;
  title?: React.ReactNode | string;
  content?: React.ReactNode | string;
  noText?: string;
  yesText?: string;
  titleStyle?: {
    [x: string]: any;
  };
  contentStyle?: {
    [x: string]: any;
  };
  noButtonStyle?: {
    [x: string]: any;
  };
  yesButtonStyle?: {
    [x: string]: any;
  };
  onNo?: () => void;
  onYes?: () => void;
  showButtons?: boolean;
  children?: React.ReactNode;
  onBackdropPress?: () => void;
  animationIn?:
    | 'bounce'
    | 'flash'
    | 'jello'
    | 'pulse'
    | 'rotate'
    | 'rubberBand'
    | 'shake'
    | 'swing'
    | 'tada'
    | 'wobble'
    | 'bounceIn'
    | 'bounceInDown'
    | 'bounceInUp'
    | 'bounceInLeft'
    | 'bounceInRight'
    | 'bounceOut'
    | 'bounceOutDown'
    | 'bounceOutUp'
    | 'bounceOutLeft'
    | 'bounceOutRight'
    | 'fadeIn'
    | 'fadeInDown'
    | 'fadeInDownBig'
    | 'fadeInUp'
    | 'fadeInUpBig'
    | 'fadeInLeft'
    | 'fadeInLeftBig'
    | 'fadeInRight'
    | 'fadeInRightBig'
    | 'fadeOut'
    | 'fadeOutDown'
    | 'fadeOutDownBig'
    | 'fadeOutUp'
    | 'fadeOutUpBig'
    | 'fadeOutLeft'
    | 'fadeOutLeftBig'
    | 'fadeOutRight'
    | 'fadeOutRightBig'
    | 'flipInX'
    | 'flipInY'
    | 'flipOutX'
    | 'flipOutY'
    | 'lightSpeedIn'
    | 'lightSpeedOut'
    | 'slideInDown'
    | 'slideInUp'
    | 'slideInLeft'
    | 'slideInRight'
    | 'slideOutDown'
    | 'slideOutUp'
    | 'slideOutLeft'
    | 'slideOutRight'
    | 'zoomIn'
    | 'zoomInDown'
    | 'zoomInUp'
    | 'zoomInLeft'
    | 'zoomInRight'
    | 'zoomOut'
    | 'zoomOutDown'
    | 'zoomOutUp'
    | 'zoomOutLeft'
    | 'zoomOutRight';
  animationOut?:
    | 'bounce'
    | 'flash'
    | 'jello'
    | 'pulse'
    | 'rotate'
    | 'rubberBand'
    | 'shake'
    | 'swing'
    | 'tada'
    | 'wobble'
    | 'bounceIn'
    | 'bounceInDown'
    | 'bounceInUp'
    | 'bounceInLeft'
    | 'bounceInRight'
    | 'bounceOut'
    | 'bounceOutDown'
    | 'bounceOutUp'
    | 'bounceOutLeft'
    | 'bounceOutRight'
    | 'fadeIn'
    | 'fadeInDown'
    | 'fadeInDownBig'
    | 'fadeInUp'
    | 'fadeInUpBig'
    | 'fadeInLeft'
    | 'fadeInLeftBig'
    | 'fadeInRight'
    | 'fadeInRightBig'
    | 'fadeOut'
    | 'fadeOutDown'
    | 'fadeOutDownBig'
    | 'fadeOutUp'
    | 'fadeOutUpBig'
    | 'fadeOutLeft'
    | 'fadeOutLeftBig'
    | 'fadeOutRight'
    | 'fadeOutRightBig'
    | 'flipInX'
    | 'flipInY'
    | 'flipOutX'
    | 'flipOutY'
    | 'lightSpeedIn'
    | 'lightSpeedOut'
    | 'slideInDown'
    | 'slideInUp'
    | 'slideInLeft'
    | 'slideInRight'
    | 'slideOutDown'
    | 'slideOutUp'
    | 'slideOutLeft'
    | 'slideOutRight'
    | 'zoomIn'
    | 'zoomInDown'
    | 'zoomInUp'
    | 'zoomInLeft'
    | 'zoomInRight'
    | 'zoomOut'
    | 'zoomOutDown'
    | 'zoomOutUp'
    | 'zoomOutLeft'
    | 'zoomOutRight';
}
const Modal = ({
  visible,
  title,
  content,
  noText = 'No',
  yesText = 'Yes',
  titleStyle,
  contentStyle,
  noButtonStyle,
  yesButtonStyle,
  onNo,
  onYes,
  showButtons = true,
  children,
  animationIn = 'slideInDown',
  animationOut = 'slideOutRight',
  onBackdropPress,
}: Props) => {
  return (
    <RNModal
      isVisible={visible}
      animationIn={animationIn}
      animationOut={animationOut}
      backdropTransitionOutTiming={0}
      onBackdropPress={onBackdropPress}
    >
      <View style={styles.modal}>
        {title ? (
          <Text style={[styles.modalTitle, titleStyle]}>{title}</Text>
        ) : null}
        {content ? (
          <Text style={[styles.modalContent, contentStyle]}>{content}</Text>
        ) : null}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {showButtons ? (
            <>
              <Button
                type='secondary'
                style={{ ...styles.modalButton, ...noButtonStyle }}
                textStyle={{ fontSize: 15 }}
                onPress={onNo}
              >
                {noText}
              </Button>
              <View style={{ flex: 1 }} />
              <Button
                type='primary'
                style={{ ...styles.modalButton, ...yesButtonStyle }}
                textStyle={{ fontSize: 15 }}
                onPress={onYes}
              >
                {yesText}
              </Button>
            </>
          ) : null}
          {children}
        </View>
      </View>
    </RNModal>
  );
};

const styles = EStyleSheet.create({
  modal: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    ...ShadowStyle,
  },
  modalTitle: {
    fontSize: '$heading',
    fontFamily: '$boldFont',
    marginBottom: 20,
    color: 'black',
  },
  modalTitleClock: {
    color: '#E56E6E',
  },
  modalTitleUpdate: {
    color: '$ceruleanFrost',
  },
  modalContent: {
    color: 'black',
    fontSize: '$body',
    fontFamily: '$normalFont',
    marginVertical: 24,
    textAlign: 'center',
  },
  modalButton: {
    flex: 1,
  },
  modalButtonText: {
    fontFamily: '$normalFont',
    fontSize: '$body',
    color: 'white',
    textAlign: 'center',
  },
});

export default Modal;
