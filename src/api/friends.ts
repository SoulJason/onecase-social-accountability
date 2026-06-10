import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { currentUserId, fetchProfilesByIds, type Profile } from "./profile";

type FriendshipRow = {
  user_low: string;
  user_high: string;
  status: "pending" | "accepted" | "blocked";
  requested_by: string;
  created_at: string;
};

/** Friendships store each pair once, ordered (user_low < user_high). */
function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["friends"] });
  qc.invalidateQueries({ queryKey: ["incoming-requests"] });
  qc.invalidateQueries({ queryKey: ["friendship-statuses"] });
}

export type RelStatus = "friends" | "outgoing" | "incoming";

/** Map of other-user-id → my relationship with them (for the add-friends screen). */
export function useFriendshipStatuses() {
  return useQuery({
    queryKey: ["friendship-statuses"],
    queryFn: async (): Promise<Record<string, RelStatus>> => {
      const me = await currentUserId();
      const { data, error } = await supabase
        .from("friendships")
        .select("*")
        .or(`user_low.eq.${me},user_high.eq.${me}`);
      if (error) throw error;
      const map: Record<string, RelStatus> = {};
      for (const r of (data ?? []) as FriendshipRow[]) {
        const other = r.user_low === me ? r.user_high : r.user_low;
        if (r.status === "accepted") map[other] = "friends";
        else if (r.status === "pending") map[other] = r.requested_by === me ? "outgoing" : "incoming";
      }
      return map;
    },
  });
}

export function useFriends() {
  return useQuery({
    queryKey: ["friends"],
    queryFn: async (): Promise<Profile[]> => {
      const me = await currentUserId();
      const { data, error } = await supabase
        .from("friendships")
        .select("*")
        .eq("status", "accepted")
        .or(`user_low.eq.${me},user_high.eq.${me}`);
      if (error) throw error;
      const rows = (data ?? []) as FriendshipRow[];
      const otherIds = rows.map((r) => (r.user_low === me ? r.user_high : r.user_low));
      const map = await fetchProfilesByIds(otherIds);
      return otherIds.map((id) => map[id]).filter(Boolean);
    },
  });
}

export function useIncomingRequests() {
  return useQuery({
    queryKey: ["incoming-requests"],
    queryFn: async (): Promise<Profile[]> => {
      const me = await currentUserId();
      const { data, error } = await supabase
        .from("friendships")
        .select("*")
        .eq("status", "pending")
        .neq("requested_by", me)
        .or(`user_low.eq.${me},user_high.eq.${me}`);
      if (error) throw error;
      const rows = (data ?? []) as FriendshipRow[];
      const senderIds = rows.map((r) => r.requested_by);
      const map = await fetchProfilesByIds(senderIds);
      return senderIds.map((id) => map[id]).filter(Boolean);
    },
  });
}

export function useSendFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (otherId: string) => {
      const me = await currentUserId();
      const [low, high] = orderedPair(me, otherId);
      const { error } = await supabase.from("friendships").insert({
        user_low: low,
        user_high: high,
        status: "pending",
        requested_by: me,
      });
      if (error) throw error;
    },
    onSuccess: () => invalidateAll(qc),
  });
}

export function useAcceptFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (otherId: string) => {
      const me = await currentUserId();
      const [low, high] = orderedPair(me, otherId);
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("user_low", low)
        .eq("user_high", high);
      if (error) throw error;
    },
    onSuccess: () => invalidateAll(qc),
  });
}

export function useRemoveFriend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (otherId: string) => {
      const me = await currentUserId();
      const [low, high] = orderedPair(me, otherId);
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("user_low", low)
        .eq("user_high", high);
      if (error) throw error;
    },
    onSuccess: () => invalidateAll(qc),
  });
}
