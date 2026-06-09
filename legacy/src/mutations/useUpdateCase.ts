import { PostgrestError } from '@supabase/supabase-js';
import { useMutation, useQueryClient } from 'react-query';
import supabase from '../lib/supabase';

const updateCase = async (
  caseId: number,
  title: string,
  emoji: string,
  users: string[]
) => {
  const { data, error } = await supabase
    .from('cases')
    .update({ title, emoji })
    .eq('id', caseId);

  if (error) throw error;
  let numRemoved = 0;
  let numAdded = 0;
  if (data) {
    // Remove all unselected users
    const { data: usersCases } = await supabase
      .from('users_cases')
      .select('*')
      .eq('case_id', caseId);

    if (usersCases) {
      const existingUserIds: string[] = usersCases.map(
        (usersCase) => usersCase.user_id
      );
      const removedUserIds = existingUserIds.filter(
        (userId) => !users.includes(userId)
      );
      await Promise.all(
        removedUserIds.map(async (id) => {
          await supabase
            .from('users_cases')
            .delete()
            .match({ user_id: id, case_id: caseId });
        })
      );
      numRemoved = removedUserIds.length;
      // Add new selected users
      const newUserIds = users.filter(
        (userId) => !existingUserIds.includes(userId)
      );
      await Promise.all(
        newUserIds.map(async (id) => {
          await supabase
            .from('users_cases')
            .insert({ user_id: id, case_id: caseId });
        })
      );
      numAdded = newUserIds.length;
    }
  }

  return { ...data, numRemoved, numAdded };
};

export default function useUpdateCase() {
  const queryClient = useQueryClient();
  const user = supabase.auth.user();

  return useMutation(
    ({
      caseId,
      title,
      emoji,
      users,
    }: {
      caseId: number;
      title: string;
      emoji: string;
      users: string[];
    }) => updateCase(caseId, title, emoji, users)
  );
}
