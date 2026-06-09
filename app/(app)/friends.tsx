import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  useAcceptFriendRequest,
  useFriends,
  useIncomingRequests,
  useRemoveFriend,
} from "@/api/friends";
import type { Profile } from "@/api/profile";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

function displayName(p: Profile) {
  const full = [p.first_name, p.last_name].filter(Boolean).join(" ");
  return full || (p.username ? `@${p.username}` : "Someone");
}

export default function FriendsScreen() {
  const router = useRouter();
  const { data: friends, isLoading } = useFriends();
  const { data: requests } = useIncomingRequests();
  const accept = useAcceptFriendRequest();
  const remove = useRemoveFriend();

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-6 pt-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text className="text-base text-blueberry">‹ Back</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/add-friends")} hitSlop={10}>
            <Text className="text-base font-semibold text-blueberry">＋ Add</Text>
          </Pressable>
        </View>
        <Text className="mb-4 text-2xl font-extrabold text-ink">Friends</Text>

        {requests && requests.length > 0 && (
          <View className="mb-6">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
              Requests
            </Text>
            <View className="gap-2">
              {requests.map((p) => (
                <View
                  key={p.id}
                  className="flex-row items-center rounded-2xl bg-white p-3"
                >
                  <Avatar name={p.username ?? p.first_name} size={40} />
                  <View className="ml-3 flex-1">
                    <Text className="font-semibold text-ink">{displayName(p)}</Text>
                    {p.username && <Text className="text-xs text-ink/40">@{p.username}</Text>}
                  </View>
                  <Pressable
                    onPress={() => accept.mutate(p.id)}
                    className="rounded-xl bg-apple px-4 py-2"
                  >
                    <Text className="font-semibold text-white">Accept</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}

        <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
          Your friends
        </Text>
        {isLoading ? (
          <ActivityIndicator color="#7189FF" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            style={{ flex: 1 }}
            data={friends ?? []}
            keyExtractor={(p) => p.id}
            contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
            ListEmptyComponent={
              <Text className="mt-6 text-center text-ink/50">
                No friends yet. Tap ＋ Add to find people by username.
              </Text>
            }
            renderItem={({ item }) => (
              <View className="flex-row items-center rounded-2xl bg-white p-3">
                <Avatar name={item.username ?? item.first_name} size={40} />
                <View className="ml-3 flex-1">
                  <Text className="font-semibold text-ink">{displayName(item)}</Text>
                  {item.username && <Text className="text-xs text-ink/40">@{item.username}</Text>}
                </View>
                <Pressable onPress={() => remove.mutate(item.id)} hitSlop={8}>
                  <Text className="text-sm text-ink/40">Remove</Text>
                </Pressable>
              </View>
            )}
          />
        )}

        <View className="pb-4">
          <Button label="＋ Add friends" onPress={() => router.push("/add-friends")} />
        </View>
      </View>
    </SafeAreaView>
  );
}
