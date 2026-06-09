import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";

import { Button } from "@/components/ui/Button";
import { FormScreen } from "@/components/ui/FormScreen";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Sign up failed", error.message);
      return;
    }

    // If email confirmation is OFF, we get a session and the auth layout
    // redirects to /home automatically. If it's ON, there's no session yet.
    if (!data.session) {
      Alert.alert("Almost there", "Check your email to confirm your account, then sign in.");
      router.replace("/sign-in");
    }
  }

  return (
    <FormScreen center>
      <View className="px-6">
        <Text className="mb-1 text-3xl font-extrabold text-ink">Create your account</Text>
        <Text className="mb-8 text-base text-ink/60">Start keeping yourself accountable.</Text>

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
            placeholder="Password (min 6 characters)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View className="mt-6">
          <Button
            label={loading ? "Creating…" : "Create account"}
            onPress={handleSignUp}
            disabled={loading || !email || !password}
          />
        </View>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-ink/60">Already have an account? </Text>
          <Link href="/sign-in" className="font-semibold text-blueberry">
            Sign in
          </Link>
        </View>
      </View>
    </FormScreen>
  );
}
