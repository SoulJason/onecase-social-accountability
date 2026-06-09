import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCases } from "@/api/cases";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const { data: cases, isLoading, isError, error } = useCases();

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-6 pt-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-extrabold text-blueberry">OneCase</Text>
          <Pressable onPress={() => supabase.auth.signOut()} hitSlop={10}>
            <Text className="text-sm font-semibold text-ink/50">Sign out</Text>
          </Pressable>
        </View>
        <Text className="mb-4 mt-1 text-base text-ink/60">Your cases</Text>

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
            renderItem={({ item }) => (
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
                <Text className="ml-4 text-lg font-semibold text-ink">{item.title}</Text>
              </Pressable>
            )}
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
