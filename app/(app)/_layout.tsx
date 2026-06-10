import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/lib/auth";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

export default function AppLayout() {
  const { session, loading } = useAuth();

  // Live bell updates (no-op until there's a session).
  useRealtimeNotifications(session?.user?.id);

  if (loading) return null;
  // Protect the app: no session → back to sign-in.
  if (!session) return <Redirect href="/sign-in" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FFFCF7" },
      }}
    />
  );
}
