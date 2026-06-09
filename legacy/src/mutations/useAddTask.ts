import { useMutation, useQueryClient } from 'react-query';
import supabase from '../lib/supabase';
import { Task } from '../types';

const createTask = async (
  userId: string,
  title: string,
  description: string,
  caseId: number
) => {
  const { data, error } = await supabase.from('tasks').insert({
    title,
    description,
    created_by: userId,
    case_id: caseId,
    assigned_to: userId,
  });

  if (error) throw error;

  return data![0] as Task;
};

export default function useAddTask(
  title: string,
  description: string,
  caseId: number
) {
  const queryClient = useQueryClient();
  const user = supabase.auth.user();

  return useMutation<Task>(
    () => createTask(user?.id ?? '', title, description, caseId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tasks', caseId]);
      },
    }
  );
}
