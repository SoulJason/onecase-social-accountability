import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCase } from "@/api/cases";
import { useCreateTask, useTasks } from "@/api/tasks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function CaseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const caseId = Number(id);
  const router = useRouter();

  const { data: caseRow } = useCase(caseId);
  const { data: tasks, isLoading } = useTasks(caseId);
  const createTask = useCreateTask(caseId);
  const [title, setTitle] = useState("");

  function add() {
    if (!title.trim()) return;
    createTask.mutate({ title: title.trim() }, { onSuccess: () => setTitle("") });
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-1 px-6 pt-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Text className="text-base text-blueberry">‹ Back</Text>
            </Pressable>
            {caseRow && (
              <Pressable onPress={() => router.push(`/edit-case/${caseId}`)} hitSlop={10}>
                <Text className="text-base font-semibold text-blueberry">Edit</Text>
              </Pressable>
            )}
          </View>

          <View className="mb-4 flex-row items-center">
            {caseRow && (
              <View
                className="mr-3 h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: caseRow.color }}
              >
                <Text className="text-2xl">{caseRow.emoji}</Text>
              </View>
            )}
            <Text className="text-2xl font-extrabold text-ink">
              {caseRow?.title ?? "Tasks"}
            </Text>
          </View>
          <Text className="mb-4 text-sm text-ink/50">Tap a task to clock in · ⋯ to edit.</Text>

          {isLoading ? (
            <ActivityIndicator color="#7189FF" style={{ marginTop: 24 }} />
          ) : (
            <FlatList
              style={{ flex: 1 }}
              data={tasks ?? []}
              keyExtractor={(t) => String(t.id)}
              contentContainerStyle={{ gap: 10, paddingBottom: 16 }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              ListEmptyComponent={
                <Text className="mt-8 text-center text-ink/50">No tasks yet. Add one below.</Text>
              }
              renderItem={({ item }) => (
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/clock-in/[taskId]",
                      params: {
                        taskId: String(item.id),
                        title: item.title,
                        progress: String(item.progress),
                      },
                    })
                  }
                  className="rounded-2xl bg-white p-4 active:opacity-70"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="flex-1 text-base font-semibold text-ink">{item.title}</Text>
                    <Text className="ml-2 text-xl">⏰</Text>
                    <Pressable
                      onPress={() => router.push(`/edit-task/${item.id}`)}
                      hitSlop={12}
                      className="ml-3"
                    >
                      <Text className="text-xl text-ink/40">⋯</Text>
                    </Pressable>
                  </View>
                  <View className="mt-3 h-2 w-full overflow-hidden rounded-full bg-ink/10">
                    <View
                      className="h-2 rounded-full bg-apple"
                      style={{ width: `${Math.max(0, Math.min(100, Math.round(item.progress)))}%` }}
                    />
                  </View>
                  <Text className="mt-1 text-xs text-ink/40">{Math.round(item.progress)}% done</Text>
                </Pressable>
              )}
            />
          )}

          <View className="gap-2 pb-4">
            <Input placeholder="New task title" value={title} onChangeText={setTitle} />
            <Button
              label={createTask.isPending ? "Adding…" : "Add task"}
              onPress={add}
              disabled={createTask.isPending || !title.trim()}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
