import { useMutation, useQueryClient } from 'react-query';
import supabase from '../lib/supabase';

const acceptCouncil = async (userId: string, caseId: number) => {
  const { data, error } = await supabase.from('users_cases').insert({
    user_id: userId,
    case_id: caseId,
  });

  if (error) throw error;

  return data;
};

export default function useAcceptCouncil(caseId: number) {
  const queryClient = useQueryClient();
  const user = supabase.auth.user();
  return useMutation(() => acceptCouncil(user?.id ?? '', caseId), {
    onSuccess: () => {
      queryClient.invalidateQueries('councilUpdates');
    },
  });
}
