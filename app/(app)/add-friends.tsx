import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  useAcceptFriendRequest,
  useFriendshipStatuses,
  useSendFriendRequest,
} from "@/api/friends";
import { useSearchUsers, type Profile } from "@/api/profile";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";

function displayName(p: Profile) {
  const full = [p.first_name, p.last_name].filter(Boolean).join(" ");
  return full || (p.username ? `@${p.username}` : "Someone");
}

export default function AddFriends() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { data: results, isFetching } = useSearchUsers(query);
  const { data: statuses } = useFriendshipStatuses();
  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();

  function add(id: string) {
    sendRequest.mutate(id, {
      onError: (e) =>
        Alert.alert("Couldn't send request", (e as Error).message || "Please try again."),
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-1 px-6 pt-4">
          <Pressable onPress={() => router.back()} className="mb-2" hitSlop={10}>
            <Text className="text-base text-blueberry">‹ Back</Text>
          </Pressable>
          <Text className="mb-4 text-2xl font-extrabold text-ink">Add friends</Text>

          <Input
            placeholder="Search by username"
            autoCapitalize="none"
            autoCorrect={false}
            value={query}
            onChangeText={setQuery}
          />

          <View className="mt-4 flex-1">
            {query.trim().length < 2 ? (
              <Text className="mt-6 text-center text-ink/40">
                Type at least 2 characters to search.
              </Text>
            ) : isFetching ? (
              <ActivityIndicator color="#7189FF" style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={results ?? []}
                keyExtractor={(p) => p.id}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
                ListEmptyComponent={
                  <Text className="mt-6 text-center text-ink/50">
                    No users found. Make sure they&apos;ve set a username.
                  </Text>
                }
                renderItem={({ item }) => {
                  const rel = statuses?.[item.id];
                  return (
                    <View className="flex-row items-center rounded-2xl bg-white p-3">
                      <Avatar name={item.username ?? item.first_name} size={40} />
                      <View className="ml-3 flex-1">
                        <Text className="font-semibold text-ink">{displayName(item)}</Text>
                        {item.username && (
                          <Text className="text-xs text-ink/40">@{item.username}</Text>
                        )}
                      </View>

                      {rel === "friends" ? (
                        <Text className="text-sm text-ink/40">Friends</Text>
                      ) : rel === "outgoing" ? (
                        <Text className="text-sm text-ink/40">Requested</Text>
                      ) : rel === "incoming" ? (
                        <Pressable
                          onPress={() => acceptRequest.mutate(item.id)}
                          className="rounded-xl bg-apple px-4 py-2"
                        >
                          <Text className="font-semibold text-white">Accept</Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          onPress={() => add(item.id)}
                          className="rounded-xl bg-blueberry px-4 py-2"
                        >
                          <Text className="font-semibold text-white">Add</Text>
                        </Pressable>
                      )}
                    </View>
                  );
                }}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
