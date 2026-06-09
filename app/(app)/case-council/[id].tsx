import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCase } from "@/api/cases";
import { useAddCaseMember, useCaseMembers, useRemoveCaseMember } from "@/api/council";
import { useFriends } from "@/api/friends";
import { useMyProfile, type Profile } from "@/api/profile";
import { Avatar } from "@/components/ui/Avatar";

function displayName(p: Profile) {
  const full = [p.first_name, p.last_name].filter(Boolean).join(" ");
  return full || (p.username ? `@${p.username}` : "Someone");
}

export default function CaseCouncil() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const caseId = Number(id);
  const router = useRouter();

  const { data: caseRow } = useCase(caseId);
  const { data: me } = useMyProfile();
  const { data: members, isLoading } = useCaseMembers(caseId);
  const { data: friends } = useFriends();
  const addMember = useAddCaseMember(caseId);
  const removeMember = useRemoveCaseMember(caseId);

  const isOwner = !!caseRow && !!me && caseRow.owner_id === me.id;
  const memberIds = new Set((members ?? []).map((m) => m.id));

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-6 pt-4">
        <Pressable onPress={() => router.back()} className="mb-2" hitSlop={10}>
          <Text className="text-base text-blueberry">‹ Back</Text>
        </Pressable>
        <Text className="mb-1 text-2xl font-extrabold text-ink">Council</Text>
        <Text className="mb-4 text-sm text-ink/50">
          {caseRow?.title ? `Who keeps you honest on "${caseRow.title}".` : ""}
        </Text>

        {isLoading ? (
          <ActivityIndicator color="#7189FF" style={{ marginTop: 20 }} />
        ) : (
          <>
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
              On the council
            </Text>
            {members && members.length > 0 ? (
              <View className="mb-6 gap-2">
                {members.map((m) => (
                  <View key={m.id} className="flex-row items-center rounded-2xl bg-white p-3">
                    <Avatar name={m.username ?? m.first_name} size={40} />
                    <Text className="ml-3 flex-1 font-semibold text-ink">{displayName(m)}</Text>
                    {isOwner && (
                      <Pressable onPress={() => removeMember.mutate(m.id)} hitSlop={8}>
                        <Text className="text-sm text-ink/40">Remove</Text>
                      </Pressable>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <Text className="mb-6 text-ink/50">No one yet.</Text>
            )}

            {isOwner && (
              <>
                <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
                  Add from your friends
                </Text>
                <FlatList
                  style={{ flex: 1 }}
                  data={(friends ?? []).filter((f) => !memberIds.has(f.id))}
                  keyExtractor={(p) => p.id}
                  contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
                  ListEmptyComponent={
                    <Text className="mt-2 text-ink/50">
                      No friends to add. Add friends first, then build your council.
                    </Text>
                  }
                  renderItem={({ item }) => (
                    <View className="flex-row items-center rounded-2xl bg-white p-3">
                      <Avatar name={item.username ?? item.first_name} size={40} />
                      <Text className="ml-3 flex-1 font-semibold text-ink">
                        {displayName(item)}
                      </Text>
                      <Pressable
                        onPress={() => addMember.mutate(item.id)}
                        className="rounded-xl bg-blueberry px-4 py-2"
                      >
                        <Text className="font-semibold text-white">Add</Text>
                      </Pressable>
                    </View>
                  )}
                />
              </>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
