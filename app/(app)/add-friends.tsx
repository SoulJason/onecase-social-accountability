import { useState } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useFriends, useSendFriendRequest } from "@/api/friends";
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
  const { data: friends } = useFriends();
  const sendRequest = useSendFriendRequest();
  const [sent, setSent] = useState<Record<string, boolean>>({});

  const friendIds = new Set((friends ?? []).map((f) => f.id));

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
                  <Text className="mt-6 text-center text-ink/50">No users found.</Text>
                }
                renderItem={({ item }) => {
                  const already = friendIds.has(item.id);
                  const requested = sent[item.id];
                  return (
                    <View className="flex-row items-center rounded-2xl bg-white p-3">
                      <Avatar name={item.username ?? item.first_name} size={40} />
                      <View className="ml-3 flex-1">
                        <Text className="font-semibold text-ink">{displayName(item)}</Text>
                        {item.username && (
                          <Text className="text-xs text-ink/40">@{item.username}</Text>
                        )}
                      </View>
                      {already ? (
                        <Text className="text-sm text-ink/40">Friends</Text>
                      ) : requested ? (
                        <Text className="text-sm text-ink/40">Requested</Text>
                      ) : (
                        <Pressable
                          onPress={() =>
                            sendRequest.mutate(item.id, {
                              onSuccess: () => setSent((s) => ({ ...s, [item.id]: true })),
                            })
                          }
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
