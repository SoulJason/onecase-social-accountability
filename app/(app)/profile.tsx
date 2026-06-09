import { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useMyProfile, useUpdateProfile } from "@/api/profile";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { FormScreen } from "@/components/ui/FormScreen";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function ProfileScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { data: profile } = useMyProfile();
  const updateProfile = useUpdateProfile();

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (profile && !hydrated) {
      setUsername(profile.username ?? "");
      setFirstName(profile.first_name ?? "");
      setLastName(profile.last_name ?? "");
      setHydrated(true);
    }
  }, [profile, hydrated]);

  function save() {
    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, "");
    if (!cleanUsername) {
      Alert.alert("Username required", "Pick a username so friends can find you.");
      return;
    }
    updateProfile.mutate(
      { username: cleanUsername, first_name: firstName.trim(), last_name: lastName.trim() },
      {
        onSuccess: () => router.back(),
        onError: (e) => {
          const msg = (e as Error).message.includes("duplicate")
            ? "That username is taken — try another."
            : (e as Error).message;
          Alert.alert("Couldn't save", msg);
        },
      },
    );
  }

  return (
    <FormScreen>
      <View className="px-6 pt-4">
        <Pressable onPress={() => router.back()} className="mb-2" hitSlop={10}>
          <Text className="text-base text-blueberry">‹ Back</Text>
        </Pressable>

        <View className="mb-6 items-center">
          <Avatar name={username || profile?.username} size={72} />
          <Text className="mt-2 text-sm text-ink/50">{session?.user.email}</Text>
        </View>

        <Text className="mb-2 text-sm font-semibold text-ink/60">Username</Text>
        <Input
          placeholder="username"
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={setUsername}
        />

        <View className="mt-6 flex-row gap-3">
          <View className="flex-1">
            <Text className="mb-2 text-sm font-semibold text-ink/60">First name</Text>
            <Input placeholder="First" value={firstName} onChangeText={setFirstName} />
          </View>
          <View className="flex-1">
            <Text className="mb-2 text-sm font-semibold text-ink/60">Last name</Text>
            <Input placeholder="Last" value={lastName} onChangeText={setLastName} />
          </View>
        </View>

        <View className="mt-10 gap-3">
          <Button
            label={updateProfile.isPending ? "Saving…" : "Save profile"}
            onPress={save}
            disabled={updateProfile.isPending}
          />
          <Pressable onPress={() => supabase.auth.signOut()} className="py-3" hitSlop={8}>
            <Text className="text-center font-semibold text-danger">Sign out</Text>
          </Pressable>
        </View>
      </View>
    </FormScreen>
  );
}
