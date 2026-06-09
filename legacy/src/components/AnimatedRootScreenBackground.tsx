import React, { useEffect } from 'react';
import { Animated, Easing, View, Image } from 'react-native';

import row1 from '../assets/images/row1.png';
import row2 from '../assets/images/row2.png';
import row3 from '../assets/images/row3.png';
import row4 from '../assets/images/row4.png';

export const INPUT_RANGE_START = 0;
export const INPUT_RANGE_END = 1;
export const OUTPUT_RANGE_START = -680;
export const OUTPUT_RANGE_END = 0;
export const ANIMATION_TO_VALUE = 1;
export const ANIMATION_DURATION = 8500;

function AnimatedRootScreenBackground() {
  const initialValue = 0;
  const translateValue = new Animated.Value(initialValue);

  useEffect(() => {
    const translate = () => {
      translateValue.setValue(initialValue);
      Animated.timing(translateValue, {
        toValue: ANIMATION_TO_VALUE,
        duration: ANIMATION_DURATION,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => translate());
    };

    translate();
  }, [translateValue]);

  const translateAnimation = translateValue.interpolate({
    inputRange: [INPUT_RANGE_START, INPUT_RANGE_END],
    outputRange: [OUTPUT_RANGE_START, OUTPUT_RANGE_END],
  });

  return (
    <View>
      <View>
        <Animated.View
          style={{
            flexDirection: 'row',
            overflow: 'hidden',
            transform: [
              {
                translateX: translateAnimation,
              },
            ],
          }}
        >
          <Image style={{ marginHorizontal: 10 }} source={row1} />
          <Image style={{ marginHorizontal: 10 }} source={row1} />
          <Image style={{ marginHorizontal: 10 }} source={row1} />
        </Animated.View>
      </View>
      <View></View>
      <Animated.View
        style={{
          marginVertical: 10,
          flexDirection: 'row',
          overflow: 'hidden',
          transform: [
            {
              translateX: translateAnimation,
            },
          ],
        }}
      >
        <Animated.Image
          style={{ marginHorizontal: 10, right: 100 }}
          source={row2}
        />
        <Animated.Image
          style={{ marginHorizontal: 10, right: 100 }}
          source={row2}
        />
        <Animated.Image
          style={{ marginHorizontal: 10, right: 100 }}
          source={row2}
        />
      </Animated.View>
      <Animated.View
        style={{
          marginVertical: 10,
          flexDirection: 'row',
          overflow: 'hidden',
          transform: [
            {
              translateX: translateAnimation,
            },
          ],
        }}
      >
        <Animated.Image
          style={{ marginHorizontal: 10, right: 200 }}
          source={row3}
        />
        <Animated.Image
          style={{ marginHorizontal: 10, right: 200 }}
          source={row3}
        />
        <Animated.Image
          style={{ marginHorizontal: 10, right: 200 }}
          source={row3}
        />
      </Animated.View>
      <Animated.View
        style={{
          marginVertical: 10,
          flexDirection: 'row',
          overflow: 'hidden',
          transform: [
            {
              translateX: translateAnimation,
            },
          ],
        }}
      >
        <Animated.Image
          style={{ marginHorizontal: 10, right: 150 }}
          source={row4}
        />
        <Animated.Image
          style={{ marginHorizontal: 10, right: 150 }}
          source={row4}
        />
        <Animated.Image
          style={{ marginHorizontal: 10, right: 150 }}
          source={row4}
        />
      </Animated.View>
    </View>
  );
}

export default AnimatedRootScreenBackground;
