import { Pressable, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

type Variant = "primary" | "danger" | "secondary";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
};

const VARIANT_BG: Record<Variant, string> = {
  primary: "bg-apple",
  danger: "bg-danger",
  secondary: "bg-cerulean",
};

export function Button({ label, onPress, variant = "primary", disabled }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => {
          scale.value = withSpring(0.96, { damping: 20, stiffness: 400 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 300 });
        }}
        className={`${VARIANT_BG[variant]} rounded-2xl py-4 ${disabled ? "opacity-40" : ""}`}
      >
        <Text className="text-center text-lg font-bold text-white">{label}</Text>
      </Pressable>
    </Animated.View>
  );
}
