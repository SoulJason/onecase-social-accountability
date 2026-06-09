import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const { session } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-6 pt-8">
        <Text className="text-3xl font-extrabold text-blueberry">OneCase</Text>
        <Text className="mt-2 text-base text-ink/60">You&apos;re signed in 🎉</Text>

        <View className="mt-6 rounded-2xl bg-white p-5">
          <Text className="text-xs uppercase tracking-wide text-ink/40">Account</Text>
          <Text className="mt-1 text-lg font-semibold text-ink">
            {session?.user.email}
          </Text>
        </View>

        <Text className="mt-8 text-sm leading-5 text-ink/50">
          This is your home base. Next we&apos;ll build cases, tasks, and the clock-in
          right here.
        </Text>

        <View className="mt-auto pb-6">
          <Button label="Sign out" variant="danger" onPress={() => supabase.auth.signOut()} />
        </View>
      </View>
    </SafeAreaView>
  );
}
