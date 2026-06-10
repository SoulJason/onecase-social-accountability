import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { currentUserId, fetchProfilesByIds, type Profile } from "./profile";

export type ActivityItem = {
  id: number;
  user: Profile | null;
  status: "live" | "succeeded" | "failed";
  isLive: boolean;
  startedAt: string;
  endedAt: string | null;
  plannedSeconds: number;
  taskTitle: string;
  caseTitle: string;
  caseEmoji: string;
};

/**
 * What your council circle is up to: clock-in sessions by other people on
 * cases you can see (yours that they're on, or theirs that you're on).
 * RLS does the scoping — this query only ever returns sessions you're
 * allowed to see.
 */
export function useCouncilActivity() {
  return useQuery({
    queryKey: ["council-activity"],
    queryFn: async (): Promise<ActivityItem[]> => {
      const me = await currentUserId();
      const { data, error } = await supabase
        .from("clock_in_sessions")
        .select(
          "id, user_id, status, started_at, ended_at, planned_seconds, tasks(title, cases(title, emoji))",
        )
        .neq("user_id", me)
        .in("status", ["live", "succeeded", "failed"])
        .order("started_at", { ascending: false })
        .limit(30);
      if (error) throw error;

      const rows = (data ?? []) as any[];
      const profiles = await fetchProfilesByIds(rows.map((r) => r.user_id));
      const now = Date.now();

      const items: ActivityItem[] = rows.map((r) => {
        const task = r.tasks ?? {};
        const cse = task?.cases ?? {};
        // A session only counts as live while its planned window is still open;
        // anything past that with no ending is a stale session (e.g. force-quit).
        const isLive =
          r.status === "live" &&
          Date.parse(r.started_at) + r.planned_seconds * 1000 + 30_000 > now;
        return {
          id: r.id,
          user: profiles[r.user_id] ?? null,
          status: r.status,
          isLive,
          startedAt: r.started_at,
          endedAt: r.ended_at,
          plannedSeconds: r.planned_seconds,
          taskTitle: task?.title ?? "a task",
          caseTitle: cse?.title ?? "",
          caseEmoji: cse?.emoji ?? "",
        };
      });

      return items
        .filter((i) => i.isLive || i.status !== "live")
        .sort(
          (a, b) =>
            Number(b.isLive) - Number(a.isLive) ||
            Date.parse(b.startedAt) - Date.parse(a.startedAt),
        );
    },
    refetchInterval: 20_000,
  });
}
