import { useQuery } from 'react-query';
import supabase from '../lib/supabase';
import { Task, User } from '../types';
import toCamelCase from '../utils/toCamelCase';

const fetchTasks = async (userId: string, caseId: number) => {
  /*
  Two conditions exist for "Assigned Tasks":
  1. You created the task. created_by = YOU, assigned_to = NULL (or YOU)
  2. Someone else created the task and assigned it to you. created_by = THEM, assigned_to = YOU
  */
  const { data, error } = await supabase
    .from('tasks')
    .select(
      `
      id,
      title,
      description,
      progress,
      created_by,
      assigned_to,
      case_id,
        users!tasks_created_by_fkey (
          id,
          avatar_url
        )
      `
    )
    .or(
      `and(created_by.eq.${userId},case_id.eq.${caseId}),and(assigned_to.eq.${userId},case_id.eq.${caseId})`
    )
    .order('created_at');
  if (error) {
    throw error;
  }
  let tasks;
  if (data) {
    tasks = data.map((d) => {
      const task = {
        ...d,
        assigner: { id: d.users.id, avatarUrl: d.users.avatar_url },
      };
      delete task.users;
      return task;
    });
  }
  return toCamelCase(tasks);
};

export default function useTasks(caseId: number) {
  const user = supabase.auth.user();
  return useQuery<Task[]>(['tasks', caseId], () =>
    fetchTasks(user?.id ?? '', caseId)
  );
}
