import { useEffect, useMemo } from "react";
import { Dimensions, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const COLORS = ["#7189FF", "#96DE90", "#FF8A65", "#FFD166", "#BA68C8", "#FF5858"];

function Piece({ index, width }: { index: number; width: number }) {
  const cfg = useMemo(
    () => ({
      x: Math.random() * width,
      size: 6 + Math.random() * 8,
      color: COLORS[index % COLORS.length],
      delay: Math.random() * 500,
      spin: (Math.random() - 0.5) * 900,
      drift: (Math.random() - 0.5) * 100,
      fall: 450 + Math.random() * 350,
      duration: 1500 + Math.random() * 900,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      cfg.delay,
      withTiming(1, { duration: cfg.duration, easing: Easing.out(Easing.quad) }),
    );
  }, [cfg, t]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: t.value * cfg.fall },
      { translateX: t.value * cfg.drift },
      { rotate: `${t.value * cfg.spin}deg` },
    ],
    opacity: t.value < 0.75 ? 1 : 1 - (t.value - 0.75) / 0.25,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: -20,
          left: cfg.x,
          width: cfg.size,
          height: cfg.size * 0.6,
          borderRadius: 2,
          backgroundColor: cfg.color,
        },
        style,
      ]}
    />
  );
}

/** A one-shot confetti burst that rains from the top of the screen. */
export function Confetti({ count = 44 }: { count?: number }) {
  const width = Dimensions.get("window").width;
  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {Array.from({ length: count }, (_, i) => (
        <Piece key={i} index={i} width={width} />
      ))}
    </View>
  );
}
