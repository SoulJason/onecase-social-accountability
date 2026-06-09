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

export function useCase(id: number) {
  return useQuery({
    queryKey: ["case", id],
    queryFn: async (): Promise<CaseRow | null> => {
      const { data, error } = await supabase.from("cases").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return (data as CaseRow) ?? null;
    },
    enabled: Number.isFinite(id),
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

export function useUpdateCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: number; title: string; emoji: string; color: string }) => {
      const { id, ...fields } = input;
      const { error } = await supabase.from("cases").update(fields).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["cases"] });
      qc.invalidateQueries({ queryKey: ["case", vars.id] });
    },
  });
}

export function useDeleteCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("cases").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cases"] }),
  });
}
