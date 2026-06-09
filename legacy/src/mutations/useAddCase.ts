import { PostgrestError } from '@supabase/supabase-js';
import { useMutation, useQueryClient } from 'react-query';
import supabase from '../lib/supabase';

const addCase = async (
  userId: string,
  index: number,
  title: string,
  emoji: string,
  color: string,
  users: string[]
) => {
  const { data, error } = await supabase
    .from('cases')
    .insert([{ index, title, emoji, color, created_by: userId }]);

  if (error) throw error;

  if (data) {
    const caseId = data[0].id;
    await Promise.all(
      users.map(async (id) => {
        await supabase
          .from('users_cases')
          .insert({ user_id: id, case_id: caseId });
      })
    );
  }

  return data;
};

export default function useAddCase() {
  const queryClient = useQueryClient();
  const user = supabase.auth.user();

  return useMutation(
    ({
      index,
      title,
      emoji,
      color,
      users,
    }: {
      index: number;
      title: string;
      emoji: string;
      color: string;
      users: string[];
    }) => addCase(user?.id ?? '', index, title, emoji, color, users),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cases');
      },
    }
  );
}
