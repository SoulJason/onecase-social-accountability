import { useMutation, useQueryClient } from 'react-query';
import supabase from '../lib/supabase';

const addComment = async (userId: string, taskId: number, message: string) => {
  const { data, error } = await supabase.from('task_comments').insert({
    message,
    created_by: userId,
    task_id: taskId,
  });

  if (error) throw error;

  return data;
};

export default function useAddTaskComment(taskId: number, message: string) {
  const queryClient = useQueryClient();
  const user = supabase.auth.user();

  return useMutation(() => addComment(user?.id ?? '', taskId, message), {
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', taskId]);
      queryClient.invalidateQueries(['task', taskId]);
    },
  });
}
