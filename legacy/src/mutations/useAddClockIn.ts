import { useMutation, useQueryClient } from 'react-query';
import supabase from '../lib/supabase';

const addClockIn = async (
  userId: string,
  taskId: number,
  endTime: Date,
  totalTime: number
) => {
  const { data, error } = await supabase.from('clock_ins').insert({
    created_by: userId,
    task_id: taskId,
    end_time: endTime,
    total_time: totalTime,
  });

  if (error) throw error;

  return data;
};

export default function useAddClockIn(
  taskId: number,
  endTime: Date,
  totalTime: number
) {
  const user = supabase.auth.user();

  return useMutation(() =>
    addClockIn(user?.id ?? '', taskId, endTime, totalTime)
  );
}
