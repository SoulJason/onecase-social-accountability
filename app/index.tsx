import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-4xl font-extrabold text-blueberry">OneCase</Text>
        <Text className="mt-2 text-base text-ink/60">
          Social accountability with friends
        </Text>

        <View className="mt-12 w-full">
          <Button label="Get started" onPress={() => {}} />
        </View>

        <Text className="mt-8 text-xs text-ink/40">v2 · Phase 0 scaffold</Text>
      </View>
    </SafeAreaView>
  );
}
