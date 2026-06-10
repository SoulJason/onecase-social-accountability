import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

/** A progress bar that springs to its value instead of jumping. */
export function ProgressBar({ progress, height = 8 }: { progress: number; height?: number }) {
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withSpring(Math.max(0, Math.min(100, progress)), { damping: 18, stiffness: 120 });
  }, [progress, p]);

  const fill = useAnimatedStyle(() => ({
    width: `${p.value}%`,
  }));

  return (
    <View className="w-full overflow-hidden rounded-full bg-ink/10" style={{ height }}>
      <Animated.View className="rounded-full bg-apple" style={[{ height }, fill]} />
    </View>
  );
}
