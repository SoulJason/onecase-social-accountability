import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { fetchProfilesByIds, type Profile } from "./profile";

export function useCaseMembers(caseId: number) {
  return useQuery({
    queryKey: ["case-members", caseId],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from("case_members")
        .select("user_id")
        .eq("case_id", caseId);
      if (error) throw error;
      const ids = (data ?? []).map((r: { user_id: string }) => r.user_id);
      const map = await fetchProfilesByIds(ids);
      return ids.map((id) => map[id]).filter(Boolean);
    },
    enabled: Number.isFinite(caseId),
  });
}

export function useAddCaseMember(caseId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("case_members")
        .insert({ case_id: caseId, user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["case-members", caseId] }),
  });
}

export function useRemoveCaseMember(caseId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("case_members")
        .delete()
        .eq("case_id", caseId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["case-members", caseId] }),
  });
}
