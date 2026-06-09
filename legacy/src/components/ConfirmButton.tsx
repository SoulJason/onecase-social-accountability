import React from 'react';
import ShadowStyle from '../constants/ShadowStyle';
import Button from './Button';

interface Props {
  onPress?: () => void;
}
const ConfirmButton = ({ onPress }: Props) => {
  return (
    <Button
      title='Confirm'
      type='action'
      style={{
        paddingVertical: 5,
        paddingHorizontal: 5,
        borderRadius: 13,
        ...ShadowStyle,
      }}
      textStyle={{ fontSize: 18 }}
      onPress={onPress}
    >
      Confirm
    </Button>
  );
};

export default ConfirmButton;
