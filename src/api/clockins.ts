import { supabase } from "@/lib/supabase";

export type SessionStatus = "live" | "succeeded" | "failed" | "cancelled";

export async function startSession(taskId: number, plannedSeconds: number) {
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id;
  if (!uid) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("clock_in_sessions")
    .insert({ task_id: taskId, user_id: uid, planned_seconds: plannedSeconds, status: "live" })
    .select("id")
    .single();
  if (error) throw error;
  return data as { id: number };
}

export async function endSession(sessionId: number, status: Exclude<SessionStatus, "live">) {
  const { error } = await supabase
    .from("clock_in_sessions")
    .update({ status, ended_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (error) throw error;
}

/** Records a successful session: bumps the task's progress and logs an update row. */
export async function logProgress(
  taskId: number,
  oldProgress: number,
  newProgress: number,
  secondsSpent: number,
) {
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id;
  if (!uid) throw new Error("Not signed in");

  const { error: updateTaskError } = await supabase
    .from("tasks")
    .update({ progress: newProgress })
    .eq("id", taskId);
  if (updateTaskError) throw updateTaskError;

  const { error: insertUpdateError } = await supabase.from("updates").insert({
    task_id: taskId,
    created_by: uid,
    old_progress: oldProgress,
    new_progress: newProgress,
    seconds_spent: secondsSpent,
  });
  if (insertUpdateError) throw insertUpdateError;
}
