import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export type CaseRow = {
  id: number;
  owner_id: string;
  title: string;
  emoji: string;
  color: string;
  position: number;
  created_at: string;
};

export function useCases() {
  return useQuery({
    queryKey: ["cases"],
    queryFn: async (): Promise<CaseRow[]> => {
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CaseRow[];
    },
  });
}

export function useCreateCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; emoji: string; color: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Not signed in");

      const { data, error } = await supabase
        .from("cases")
        .insert({ ...input, owner_id: uid, position: 0 })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cases"] }),
  });
}
