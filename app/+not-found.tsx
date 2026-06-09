import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found", headerShown: true }} />
      <View className="flex-1 items-center justify-center bg-cream px-6">
        <Text className="text-lg text-ink">This screen doesn&apos;t exist.</Text>
        <Link href="/" className="mt-4 text-base font-semibold text-blueberry">
          Go to home
        </Link>
      </View>
    </>
  );
}
