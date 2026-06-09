import { useEffect } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMarkAllRead, useNotifications, type NotificationRow } from "@/api/notifications";

function iconFor(type: string) {
  switch (type) {
    case "clock_in_failed":
      return "😬";
    case "clock_in_succeeded":
      return "🎉";
    case "add_friend":
      return "👋";
    case "accept_friend":
      return "✅";
    case "add_council":
      return "👥";
    default:
      return "🔔";
  }
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { data: notifications, isLoading } = useNotifications();
  const markAllRead = useMarkAllRead();

  // Mark everything read when the screen opens.
  useEffect(() => {
    markAllRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderItem({ item }: { item: NotificationRow }) {
    return (
      <View
        className={`flex-row items-center rounded-2xl p-4 ${item.is_read ? "bg-white" : "bg-blueberry/10"}`}
      >
        <Text className="mr-3 text-2xl">{iconFor(item.type)}</Text>
        <View className="flex-1">
          <Text className="text-ink">{item.message ?? "You have a new notification"}</Text>
          <Text className="mt-1 text-xs text-ink/40">{timeAgo(item.created_at)}</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-6 pt-4">
        <Pressable onPress={() => router.back()} className="mb-2" hitSlop={10}>
          <Text className="text-base text-blueberry">‹ Back</Text>
        </Pressable>
        <Text className="mb-4 text-2xl font-extrabold text-ink">Notifications</Text>

        {isLoading ? (
          <ActivityIndicator color="#7189FF" style={{ marginTop: 24 }} />
        ) : (
          <FlatList
            style={{ flex: 1 }}
            data={notifications ?? []}
            keyExtractor={(n) => String(n.id)}
            contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
            ListEmptyComponent={
              <View className="mt-16 items-center">
                <Text className="text-5xl">🔔</Text>
                <Text className="mt-3 text-center text-ink/50">
                  Nothing yet.{"\n"}Friend requests and council activity show up here.
                </Text>
              </View>
            }
            renderItem={renderItem}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
