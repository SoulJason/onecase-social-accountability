import { useMutation, useQueryClient } from 'react-query';
import supabase from '../lib/supabase';

const updateTask = async (
  userId: string,
  title: string,
  description: string,
  taskId: number
) => {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      title,
      description,
    })
    .eq('id', taskId);

  if (error) throw error;

  return data;
};

export default function useUpdateTask(
  title: string,
  description: string,
  taskId: number,
  caseId: number
) {
  const queryClient = useQueryClient();
  const user = supabase.auth.user();

  return useMutation(
    () => updateTask(user?.id ?? '', title, description, taskId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tasks', caseId]);
        queryClient.invalidateQueries(['task', taskId]);
      },
    }
  );
}
