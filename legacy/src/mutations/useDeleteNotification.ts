import { useMutation, useQueryClient } from 'react-query';
import supabase from '../lib/supabase';

const deleteNotification = async (notificationId: number | number[]) => {
  let data;
  let error;
  if (Array.isArray(notificationId)) {
    for (const id of notificationId) {
      ({ data, error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id));
    }
  } else {
    ({ data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId));
  }

  if (error) throw error;

  return data;
};

export default function useDeleteNotification(
  notificationId: number | number[]
) {
  const queryClient = useQueryClient();

  return useMutation(() => deleteNotification(notificationId), {
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });
}
