import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCases } from "@/api/cases";
import { useMyProfile } from "@/api/profile";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

export default function Home() {
  const router = useRouter();
  const { data: cases, isLoading, isError, error } = useCases();
  const { data: me } = useMyProfile();

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-6 pt-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-extrabold text-blueberry">OneCase</Text>
          <View className="flex-row items-center gap-4">
            <Pressable onPress={() => router.push("/friends")} hitSlop={10}>
              <Text className="text-base font-semibold text-blueberry">Friends</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/profile")} hitSlop={10}>
              <Avatar name={me?.username ?? me?.first_name} size={36} />
            </Pressable>
          </View>
        </View>
        <Text className="mb-4 mt-1 text-base text-ink/60">Your cases</Text>

        {me && !me.username && (
          <Pressable
            onPress={() => router.push("/profile")}
            className="mb-4 rounded-2xl bg-blueberry/10 p-3"
          >
            <Text className="font-semibold text-blueberry">Set a username →</Text>
            <Text className="text-xs text-ink/50">So friends can find and add you.</Text>
          </Pressable>
        )}

        {isLoading ? (
          <ActivityIndicator color="#7189FF" style={{ marginTop: 40 }} />
        ) : isError ? (
          <Text className="mt-10 text-danger">{(error as Error).message}</Text>
        ) : cases && cases.length > 0 ? (
          <FlatList
            style={{ flex: 1 }}
            data={cases}
            keyExtractor={(c) => String(c.id)}
            contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
            renderItem={({ item }) => {
              const shared = me ? item.owner_id !== me.id : false;
              return (
                <Pressable
                  onPress={() => router.push(`/case/${item.id}`)}
                  className="flex-row items-center rounded-2xl bg-white p-4 active:opacity-70"
                >
                  <View
                    className="h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: item.color }}
                  >
                    <Text className="text-2xl">{item.emoji}</Text>
                  </View>
                  <Text className="ml-4 flex-1 text-lg font-semibold text-ink">{item.title}</Text>
                  {shared && (
                    <Text className="text-xs font-semibold text-cerulean">· council</Text>
                  )}
                </Pressable>
              );
            }}
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
