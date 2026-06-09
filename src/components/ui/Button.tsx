import { Pressable, Text } from "react-native";

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
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`${VARIANT_BG[variant]} rounded-2xl py-4 active:opacity-80 ${
        disabled ? "opacity-40" : ""
      }`}
    >
      <Text className="text-center text-lg font-bold text-white">{label}</Text>
    </Pressable>
  );
}
