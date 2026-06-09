import { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useCase, useDeleteCase, useUpdateCase } from "@/api/cases";
import { Button } from "@/components/ui/Button";
import { FormScreen } from "@/components/ui/FormScreen";
import { Input } from "@/components/ui/Input";

const COLORS = ["#96DE90", "#7189FF", "#758ECD", "#FF8A65", "#BA68C8", "#FFD166"];
const EMOJIS = ["💪", "📚", "💼", "🎯", "🏃", "🎨", "💰", "🧠"];

export default function EditCase() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const caseId = Number(id);
  const router = useRouter();

  const { data: caseRow } = useCase(caseId);
  const updateCase = useUpdateCase();
  const deleteCase = useDeleteCase();

  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (caseRow && !hydrated) {
      setTitle(caseRow.title);
      setEmoji(caseRow.emoji);
      setColor(caseRow.color);
      setHydrated(true);
    }
  }, [caseRow, hydrated]);

  function save() {
    if (!title.trim()) return;
    updateCase.mutate(
      { id: caseId, title: title.trim(), emoji, color },
      {
        onSuccess: () => router.back(),
        onError: (e) => Alert.alert("Couldn't save", (e as Error).message),
      },
    );
  }

  function confirmDelete() {
    Alert.alert(
      "Delete case?",
      "This removes the case and all of its tasks. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteCase.mutate(caseId, {
              onSuccess: () => router.dismissAll(),
              onError: (e) => Alert.alert("Couldn't delete", (e as Error).message),
            }),
        },
      ],
    );
  }

  return (
    <FormScreen>
      <View className="px-6 pt-4">
        <Pressable onPress={() => router.back()} className="mb-2" hitSlop={10}>
          <Text className="text-base text-blueberry">‹ Cancel</Text>
        </Pressable>
        <Text className="mb-6 text-2xl font-extrabold text-ink">Edit case</Text>

        <Text className="mb-2 text-sm font-semibold text-ink/60">Title</Text>
        <Input placeholder="e.g. Fitness" value={title} onChangeText={setTitle} />

        <Text className="mb-2 mt-6 text-sm font-semibold text-ink/60">Emoji</Text>
        <View className="flex-row flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <Pressable
              key={e}
              onPress={() => setEmoji(e)}
              className={`h-12 w-12 items-center justify-center rounded-xl ${
                emoji === e ? "border-2 border-blueberry bg-blueberry/20" : "bg-white"
              }`}
            >
              <Text className="text-2xl">{e}</Text>
            </Pressable>
          ))}
        </View>

        <Text className="mb-2 mt-6 text-sm font-semibold text-ink/60">Color</Text>
        <View className="flex-row flex-wrap gap-3">
          {COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={`h-12 w-12 rounded-full ${color === c ? "border-4 border-ink/30" : ""}`}
            />
          ))}
        </View>

        <View className="mt-10 gap-3">
          <Button
            label={updateCase.isPending ? "Saving…" : "Save changes"}
            onPress={save}
            disabled={updateCase.isPending || !title.trim()}
          />
          <Pressable onPress={confirmDelete} className="py-3" hitSlop={8}>
            <Text className="text-center font-semibold text-danger">Delete case</Text>
          </Pressable>
        </View>
      </View>
    </FormScreen>
  );
}
