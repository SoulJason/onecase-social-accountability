import React from 'react';
import { Image as NativeImage, Dimensions } from 'react-native';

interface Props {
  uri: string;
  dimensions: [number, number];
  margin?: number;
}

const win = Dimensions.get('window');

const Image = ({ uri, dimensions, margin }: Props) => {
  const [width, height] = dimensions;
  const adjustedWidth = margin ? win.width - margin : win.width;
  return (
    <NativeImage
      source={{ uri }}
      style={{
        width: adjustedWidth,
        height: height * (adjustedWidth / width),
      }}
    />
  );
};

export default Image;
