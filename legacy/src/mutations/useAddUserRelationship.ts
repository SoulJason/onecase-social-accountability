import { PostgrestError } from '@supabase/supabase-js';
import { useMutation, useQueryClient } from 'react-query';
import supabase from '../lib/supabase';

const addUserRelationship = async (
  userOneId: string,
  userTwoId: string,
  status: string
) => {
  console.log(userOneId, userTwoId, 'STATUS', status);
  if (status === 'cancel') {
    console.log('DELETING RELATIONSHIP');
    if (userOneId < userTwoId) {
      await supabase.from('user_relationships').delete().match({
        user_one_id: userOneId,
        user_two_id: userTwoId,
      });
      await supabase.from('users_cases').delete().match({
        user_id: userOneId,
      });
    } else {
      await supabase.from('user_relationships').delete().match({
        user_one_id: userTwoId,
        user_two_id: userOneId,
      });
    }
    const { data: userOneCaseIdsData } = await supabase
      .from('cases')
      .select('id')
      .eq('created_by', userOneId);
    const userOneCaseIds = userOneCaseIdsData?.map(
      (caseItem: any) => caseItem.id
    );
    const { data: userTwoCaseIdsData } = await supabase
      .from('cases')
      .select('id')
      .eq('created_by', userTwoId);
    const userTwoCaseIds = userTwoCaseIdsData?.map(
      (caseItem: any) => caseItem.id
    );

    // Delete any cases each user may have been a part of a council of for the other user
    if (userTwoCaseIds) {
      for (const id of userTwoCaseIds) {
        await supabase.from('users_cases').delete().match({
          user_id: userOneId,
          case_id: id,
        });
      }
    }
    if (userOneCaseIds) {
      for (const id of userOneCaseIds) {
        const { data, error } = await supabase
          .from('users_cases')
          .delete()
          .match({
            user_id: userTwoId,
            case_id: id,
          });
      }
    }
    // userTwoCaseIds?.forEach(({ id }) => {
    //   supabase.from('users_cases').delete().match({
    //     user_id: userOneId,
    //     case_id: id,
    //   });
    // });
    // userOneCaseIds?.forEach(({ id }) => {
    //   supabase.from('users_cases').delete().match({
    //     user_id: userTwoId,
    //     case_id: id,
    //   });
    // });
    // Delete any notifications the user may have
    const {} = await supabase.from('notifications').delete().match({
      sender_id: userOneId,
      receiver_id: userTwoId,
      type: 'add_friend',
    });
    return;
  }
  let idOne = userOneId;
  let idTwo = userTwoId;
  let relationshipStatus = `${status}_one_two`;
  if (userOneId > userTwoId) {
    idOne = userTwoId;
    idTwo = userOneId;
    relationshipStatus = `${status}_two_one`;
  }
  if (status === 'friends') {
    relationshipStatus = status;
  }

  const { data, error } = await supabase.from('user_relationships').upsert({
    user_one_id: idOne,
    user_two_id: idTwo,
    status: relationshipStatus,
  });
  if (error) throw error;

  return data;
};

export default function useAddUserRelationship() {
  const queryClient = useQueryClient();
  const user = supabase.auth.user();

  return useMutation(
    ({ userId, status }: { userId: string; status: string }) =>
      addUserRelationship(user?.id ?? '', userId, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('searchedUsers');
        queryClient.invalidateQueries('friends');
        queryClient.invalidateQueries('councilUpdates');
        queryClient.invalidateQueries('user');
        queryClient.invalidateQueries('cases');
        // queryClient.invalidateQueries('user', userId);
      },
    }
  );
}
