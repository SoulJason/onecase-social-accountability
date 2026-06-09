import { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useDeleteTask, useTask, useUpdateTask } from "@/api/tasks";
import { Button } from "@/components/ui/Button";
import { FormScreen } from "@/components/ui/FormScreen";
import { Input } from "@/components/ui/Input";

export default function EditTask() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = Number(id);
  const router = useRouter();

  const { data: task } = useTask(taskId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [title, setTitle] = useState("");
  const [progress, setProgress] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (task && !hydrated) {
      setTitle(task.title);
      setProgress(Math.round(task.progress));
      setHydrated(true);
    }
  }, [task, hydrated]);

  function save() {
    if (!title.trim()) return;
    updateTask.mutate(
      { id: taskId, title: title.trim(), progress },
      {
        onSuccess: () => router.back(),
        onError: (e) => Alert.alert("Couldn't save", (e as Error).message),
      },
    );
  }

  function confirmDelete() {
    Alert.alert("Delete task?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          deleteTask.mutate(taskId, {
            onSuccess: () => router.back(),
            onError: (e) => Alert.alert("Couldn't delete", (e as Error).message),
          }),
      },
    ]);
  }

  return (
    <FormScreen>
      <View className="px-6 pt-4">
        <Pressable onPress={() => router.back()} className="mb-2" hitSlop={10}>
          <Text className="text-base text-blueberry">‹ Cancel</Text>
        </Pressable>
        <Text className="mb-6 text-2xl font-extrabold text-ink">Edit task</Text>

        <Text className="mb-2 text-sm font-semibold text-ink/60">Title</Text>
        <Input placeholder="Task title" value={title} onChangeText={setTitle} />

        <Text className="mb-2 mt-6 text-sm font-semibold text-ink/60">Progress</Text>
        <View className="flex-row items-center gap-6">
          <Pressable
            onPress={() => setProgress((p) => Math.max(0, p - 5))}
            className="h-12 w-12 items-center justify-center rounded-full bg-white"
          >
            <Text className="text-2xl text-ink">−</Text>
          </Pressable>
          <Text className="w-24 text-center text-3xl font-extrabold text-blueberry">
            {progress}%
          </Text>
          <Pressable
            onPress={() => setProgress((p) => Math.min(100, p + 5))}
            className="h-12 w-12 items-center justify-center rounded-full bg-white"
          >
            <Text className="text-2xl text-ink">＋</Text>
          </Pressable>
        </View>

        <View className="mt-4 flex-row gap-3">
          <Pressable
            onPress={() => setProgress(100)}
            className="flex-1 rounded-xl bg-apple/20 py-3"
          >
            <Text className="text-center font-semibold text-apple">Mark complete</Text>
          </Pressable>
          <Pressable
            onPress={() => setProgress(0)}
            className="flex-1 rounded-xl bg-ink/5 py-3"
          >
            <Text className="text-center font-semibold text-ink/60">Reset to 0%</Text>
          </Pressable>
        </View>

        <View className="mt-10 gap-3">
          <Button
            label={updateTask.isPending ? "Saving…" : "Save changes"}
            onPress={save}
            disabled={updateTask.isPending || !title.trim()}
          />
          <Pressable onPress={confirmDelete} className="py-3" hitSlop={8}>
            <Text className="text-center font-semibold text-danger">Delete task</Text>
          </Pressable>
        </View>
      </View>
    </FormScreen>
  );
}
