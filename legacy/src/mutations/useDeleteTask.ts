import { useMutation, useQueryClient } from 'react-query';
import supabase from '../lib/supabase';

const deleteTask = async (taskId: number) => {
  const { data, error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
  if (error) throw error;

  return data;
};

export default function useDeleteTask(taskId: number, caseId?: number) {
  const queryClient = useQueryClient();

  return useMutation(() => deleteTask(taskId), {
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', caseId]);
    },
  });
}
