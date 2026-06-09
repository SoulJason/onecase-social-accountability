import { useMutation, useQueryClient } from 'react-query';
import supabase from '../lib/supabase';

const updateClockIn = async (
  userId: string,
  taskId: number,
  isLive: boolean
) => {
  const { data, error } = await supabase
    .from('clock_ins')
    .update({
      is_live: isLive,
    })
    .eq('task_id', taskId);

  if (error) throw error;

  return data;
};

export default function useUpdateClockIn(taskId: number, isLive: boolean) {
  const user = supabase.auth.user();

  return useMutation(() => updateClockIn(user?.id ?? '', taskId, isLive));
}
