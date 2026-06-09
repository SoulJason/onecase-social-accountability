import { useMutation, useQueryClient } from 'react-query';
import supabase from '../lib/supabase';

const addUpdate = async (
  userId: string,
  taskId: number,
  oldProgress: number,
  newProgress: number,
  timeSpent: number,
  totalTime: number
) => {
  const { error } = await supabase
    .from('tasks')
    .update({ progress: newProgress })
    .eq('id', taskId);

  if (error) throw error;

  const { data, error: updateError } = await supabase.from('updates').insert([
    {
      old_progress: oldProgress,
      new_progress: newProgress,
      time_spent: timeSpent,
      total_time: totalTime,
      created_by: userId,
      task_id: taskId,
    },
  ]);

  if (updateError) throw updateError;

  return data;
};

export default function useAddUpdate(
  taskId: number,
  oldProgress: number,
  newProgress: number,
  timeSpent: number,
  totalTime: number
) {
  const queryClient = useQueryClient();
  const user = supabase.auth.user();

  return useMutation(
    () =>
      addUpdate(
        user?.id ?? '',
        taskId,
        oldProgress,
        newProgress,
        timeSpent,
        totalTime
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tasks');
        queryClient.invalidateQueries(['task', taskId]);
        queryClient.invalidateQueries(['updates', taskId]);
        queryClient.invalidateQueries(['caseUpdates']);
      },
    }
  );
}
