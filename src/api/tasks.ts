import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export type TaskRow = {
  id: number;
  case_id: number;
  created_by: string;
  assigned_to: string | null;
  title: string;
  description: string | null;
  progress: number;
  created_at: string;
};

export function useTasks(caseId: number) {
  return useQuery({
    queryKey: ["tasks", caseId],
    queryFn: async (): Promise<TaskRow[]> => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as TaskRow[];
    },
    enabled: Number.isFinite(caseId),
  });
}

export function useCreateTask(caseId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; description?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Not signed in");

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          case_id: caseId,
          created_by: uid,
          title: input.title,
          description: input.description ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", caseId] }),
  });
}
