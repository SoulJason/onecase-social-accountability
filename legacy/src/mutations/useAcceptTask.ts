import { useMutation, useQueryClient } from 'react-query';
import supabase from '../lib/supabase';

const acceptTask = async (taskId: number, assigneeId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      assigned_to: assigneeId,
    })
    .eq('id', taskId);

  if (error) throw error;

  return data;
};

export default function useAcceptTask(taskId: number, assigneeId: string) {
  const queryClient = useQueryClient();

  return useMutation(() => acceptTask(taskId, assigneeId), {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
    },
  });
}
