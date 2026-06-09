import { useMutation, useQueryClient } from 'react-query';
import supabase from '../lib/supabase';

const updateUpdate = async (
  userId: string,
  updateId: number,
  newProgress: number,
  isLive: boolean
) => {
  const { data, error } = await supabase
    .from('updates')
    .update({
      new_progress: newProgress,
      isLive: isLive,
    })
    .eq('id', updateId);

  if (error) throw error;

  return data;
};

export default function useUpdateUpdate(
  updateId: number,
  newProgress: number,
  isLive: boolean = false
) {
  const queryClient = useQueryClient();
  const user = supabase.auth.user();

  return useMutation(
    () => updateUpdate(user?.id ?? '', updateId, newProgress, isLive),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['updates']);
      },
    }
  );
}
