import { useQuery } from 'react-query';
import supabase from '../lib/supabase';
import { Update } from '../types';
import toCamelCase from '../utils/toCamelCase';

const fetchUpdates = async (taskId: number) => {
  const { data, error } = await supabase
    .from('updates')
    .select(
      `
        id,
        created_at,
        old_progress,
        new_progress,
        time_spent,
        total_time
      `
    )
    .eq('task_id', taskId)
    .order('created_at');
  if (error) {
    throw error;
  }

  return toCamelCase(data);
};

export default function useUpdates(taskId: number) {
  return useQuery<Update[]>(['updates', taskId], () => fetchUpdates(taskId));
}
