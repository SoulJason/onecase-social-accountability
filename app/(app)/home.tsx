import { useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useQueryClient } from "@tanstack/react-query";

import { useCouncilActivity } from "@/api/activity";
import { useCases, type CaseRow } from "@/api/cases";
import { useUnreadCount } from "@/api/notifications";
import { useMyProfile } from "@/api/profile";
import { ActivityRow } from "@/components/ActivityRow";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

function ActivityPreview() {
  const router = useRouter();
  const { data: activity } = useCouncilActivity();

  if (!activity || activity.length === 0) return null;
  return (
    <View className="mt-5">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-wide text-ink/40">
          Council activity
        </Text>
        <Pressable onPress={() => router.push("/activity")} hitSlop={8}>
          <Text className="text-xs font-semibold text-blueberry">See all →</Text>
        </Pressable>
      </View>
      <View className="gap-2">
        {activity.slice(0, 3).map((a) => (
          <ActivityRow key={a.id} item={a} />
        ))}
      </View>
    </View>
  );
}

export default function Home() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: cases, isLoading: casesLoading, isError, error } = useCases();
  const { data: me, isLoading: meLoading } = useMyProfile();
  const { data: unread } = useUnreadCount();
  const [refreshing, setRefreshing] = useState(false);

  const isLoading = casesLoading || meLoading;
  const mine = me ? (cases ?? []).filter((c) => c.owner_id === me.id) : [];
  const shared = me ? (cases ?? []).filter((c) => c.owner_id !== me.id) : [];

  const sections = [
    { title: "Your cases", data: mine },
    ...(shared.length > 0 ? [{ title: "Shared with you", data: shared }] : []),
  ];

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["cases"] }),
      qc.invalidateQueries({ queryKey: ["council-activity"] }),
      qc.invalidateQueries({ queryKey: ["notifications-unread"] }),
    ]);
    setRefreshing(false);
  }

  function renderCase({ item, index }: { item: CaseRow; index: number }) {
    return (
      <Animated.View entering={FadeInDown.duration(250).delay(Math.min(index * 50, 250))}>
        <Pressable
          onPress={() => router.push(`/case/${item.id}`)}
          className="mb-3 flex-row items-center rounded-2xl bg-white p-4 active:opacity-70"
        >
          <View
            className="h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: item.color }}
          >
            <Text className="text-2xl">{item.emoji}</Text>
          </View>
          <Text className="ml-4 flex-1 text-lg font-semibold text-ink">{item.title}</Text>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-6 pt-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-extrabold text-blueberry">OneCase</Text>
          <View className="flex-row items-center gap-4">
            <Pressable onPress={() => router.push("/notifications")} hitSlop={10}>
              <Text className="text-2xl">{unread != null && unread > 0 ? "🔔" : "🔕"}</Text>
              {unread != null && unread > 0 && (
                <View className="absolute -right-2 -top-2 h-5 min-w-5 items-center justify-center rounded-full border-2 border-cream bg-danger px-1">
                  <Text className="text-[11px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </Text>
                </View>
              )}
            </Pressable>
            <Pressable onPress={() => router.push("/friends")} hitSlop={10}>
              <Text className="text-base font-semibold text-blueberry">Friends</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/profile")} hitSlop={10}>
              <Avatar name={me?.username ?? me?.first_name} size={36} />
            </Pressable>
          </View>
        </View>

        {me && !me.username && (
          <Pressable
            onPress={() => router.push("/profile")}
            className="mb-2 mt-4 rounded-2xl bg-blueberry/10 p-3"
          >
            <Text className="font-semibold text-blueberry">Set a username →</Text>
            <Text className="text-xs text-ink/50">So friends can find and add you.</Text>
          </Pressable>
        )}

        {isLoading ? (
          <ActivityIndicator color="#7189FF" style={{ marginTop: 40 }} />
        ) : isError ? (
          <Text className="mt-10 text-danger">{(error as Error).message}</Text>
        ) : (cases ?? []).length > 0 ? (
          <SectionList
            style={{ flex: 1 }}
            sections={sections}
            keyExtractor={(c) => String(c.id)}
            contentContainerStyle={{ paddingBottom: 24 }}
            stickySectionHeadersEnabled={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7189FF" />
            }
            ListHeaderComponent={<ActivityPreview />}
            renderSectionHeader={({ section }) =>
              section.data.length > 0 ? (
                <Text className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-ink/40">
                  {section.title}
                </Text>
              ) : null
            }
            renderItem={renderCase}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-5xl">🗂️</Text>
            <Text className="mt-3 text-center text-ink/50">
              No cases yet.{"\n"}Create your first one below.
            </Text>
          </View>
        )}

        <View className="pb-4">
          <Button label="＋  New case" onPress={() => router.push("/new-case")} />
        </View>
      </View>
    </SafeAreaView>
  );
}
