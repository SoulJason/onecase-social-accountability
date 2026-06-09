import { useMutation, useQueryClient } from 'react-query';
import supabase from '../lib/supabase';

const assignTask = async (
  assignerId: string,
  assigneeId: string | null,
  title: string,
  description: string,
  caseId: number
) => {
  const { data, error } = await supabase.from('tasks').insert({
    title,
    description,
    created_by: assignerId,
    assigned_to: assigneeId,
    case_id: caseId,
  });

  if (error) throw error;

  return data;
};

export default function useAssignTask(
  assignerId: string,
  assigneeId: string | null,
  title: string,
  description: string,
  caseId: number
) {
  const queryClient = useQueryClient();
  const user = supabase.auth.user();

  return useMutation(
    () => assignTask(assignerId, assigneeId, title, description, caseId),
    {
      // onSuccess: () => {
      //   queryClient.refetchQueries('tasks');
      // },
    }
  );
}
