import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/lib/auth";
import { useRealtimeActivity } from "@/hooks/useRealtimeActivity";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

export default function AppLayout() {
  const { session, loading } = useAuth();

  // Live bell + activity feed updates (no-ops until there's a session).
  useRealtimeNotifications(session?.user?.id);
  useRealtimeActivity(session?.user?.id);

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
