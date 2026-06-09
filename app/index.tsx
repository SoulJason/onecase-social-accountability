import { Redirect, useRouter } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";

export default function Index() {
  const router = useRouter();
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color="#7189FF" />
      </View>
    );
  }

  // Already signed in → straight to the app.
  if (session) {
    return <Redirect href="/home" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-4xl font-extrabold text-blueberry">OneCase</Text>
        <Text className="mt-2 text-base text-ink/60">
          Social accountability with friends
        </Text>

        <View className="mt-12 w-full">
          <Button label="Get started" onPress={() => router.push("/sign-up")} />
          <View className="h-3" />
          <Button
            label="I already have an account"
            variant="secondary"
            onPress={() => router.push("/sign-in")}
          />
        </View>

        <Text className="mt-8 text-xs text-ink/40">v2 · Phase 1</Text>
      </View>
    </SafeAreaView>
  );
}
