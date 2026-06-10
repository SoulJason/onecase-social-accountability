import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useCouncilActivity } from "@/api/activity";
import { ActivityRow } from "@/components/ActivityRow";

export default function ActivityScreen() {
  const router = useRouter();
  const { data: activity, isLoading, refetch } = useCouncilActivity();
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-6 pt-4">
        <Pressable onPress={() => router.back()} className="mb-2" hitSlop={10}>
          <Text className="text-base text-blueberry">‹ Back</Text>
        </Pressable>
        <Text className="mb-4 text-2xl font-extrabold text-ink">Council activity</Text>

        {isLoading ? (
          <ActivityIndicator color="#7189FF" style={{ marginTop: 24 }} />
        ) : (
          <FlatList
            style={{ flex: 1 }}
            data={activity ?? []}
            keyExtractor={(a) => String(a.id)}
            contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7189FF" />
            }
            ListEmptyComponent={
              <View className="mt-16 items-center px-6">
                <Text className="text-5xl">📡</Text>
                <Text className="mt-3 text-center text-ink/50">
                  Nothing yet. When people on your cases (or cases you&apos;re on) clock in,
                  succeed, or bail — it shows up here, live.
                </Text>
              </View>
            }
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.duration(250).delay(Math.min(index * 40, 240))}>
                <ActivityRow item={item} />
              </Animated.View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
