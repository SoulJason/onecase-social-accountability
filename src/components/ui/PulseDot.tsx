import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

/** A pulsing red "live" indicator. */
export function PulseDot({ size = 10 }: { size?: number }) {
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [p]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - p.value * 0.55,
    transform: [{ scale: 1 + p.value * 0.25 }],
  }));

  return (
    <Animated.View
      style={[
        { width: size, height: size, borderRadius: size / 2, backgroundColor: "#FF5858" },
        style,
      ]}
    />
  );
}
