import React, { useEffect } from 'react';
import { Animated, View, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  duration?: number;
  repeatCount?: number;
}

function BlinkView({ children, style, duration, repeatCount }: Props) {
  const fadeAnimation = new Animated.Value(0);

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(fadeAnimation, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    animate();
  }, []);

  return (
    <View style={style}>
      <Animated.View style={{ opacity: fadeAnimation }}>
        {children}
      </Animated.View>
    </View>
  );
}

export default BlinkView;
