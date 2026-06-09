import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Sign in failed", error.message);
      return;
    }
    // On success the auth layout redirects to /home automatically.
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 justify-center px-6">
        <Text className="mb-1 text-3xl font-extrabold text-ink">Welcome back</Text>
        <Text className="mb-8 text-base text-ink/60">Sign in to your council.</Text>

        <View className="gap-3">
          <Input
            placeholder="Email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View className="mt-6">
          <Button
            label={loading ? "Signing in…" : "Sign in"}
            onPress={handleSignIn}
            disabled={loading || !email || !password}
          />
        </View>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-ink/60">No account yet? </Text>
          <Link href="/sign-up" className="font-semibold text-blueberry">
            Create one
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
