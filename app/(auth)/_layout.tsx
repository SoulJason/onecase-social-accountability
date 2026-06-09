import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/lib/auth";

export default function AuthLayout() {
  const { session, loading } = useAuth();

  if (loading) return null;
  // Signed in users shouldn't see the auth screens.
  if (session) return <Redirect href="/home" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FFFCF7" },
      }}
    />
  );
}
