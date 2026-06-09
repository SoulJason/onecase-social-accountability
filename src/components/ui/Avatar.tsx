import { Text, View } from "react-native";

export function Avatar({ name, size = 40 }: { name?: string | null; size?: number }) {
  const initial = (name ?? "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <View
      className="items-center justify-center bg-blueberry"
      style={{ width: size, height: size, borderRadius: size / 2 }}
    >
      <Text className="font-bold text-white" style={{ fontSize: size * 0.42 }}>
        {initial}
      </Text>
    </View>
  );
}
