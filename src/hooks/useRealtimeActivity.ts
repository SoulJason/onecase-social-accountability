import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

/**
 * Refreshes the council activity feed the moment a friend clocks in or a
 * session ends. RLS scopes delivery to rows this user is allowed to see.
 */
export function useRealtimeActivity(userId?: string) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`activity:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clock_in_sessions" },
        () => {
          qc.invalidateQueries({ queryKey: ["council-activity"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, qc]);
}
