import { PostgrestError } from '@supabase/supabase-js';
import { decode } from 'base64-arraybuffer';
import { useMutation, useQueryClient } from 'react-query';
import supabase from '../lib/supabase';

const updateAvatarUrl = async (userId: string, base64Image: string) => {
  const avatarUrlPath = `public/${userId}.jpeg`;
  await supabase.storage
    .from('avatars')
    .upload(avatarUrlPath, decode(base64Image), {
      contentType: 'image/jpeg',
      upsert: true,
    });
  const { publicURL } = await supabase.storage
    .from('avatars')
    .getPublicUrl(avatarUrlPath);
  await supabase
    .from('users')
    .update({
      avatar_url: publicURL,
    })
    .eq('id', userId);
};
const updateUser = async (
  userId: string,
  firstName: string,
  lastName: string,
  username: string,
  base64Image: string
) => {
  if (base64Image !== '') {
    await updateAvatarUrl(userId, base64Image);
  }
  const { data, error } = await supabase
    .from('users')
    .update({
      first_name: firstName,
      last_name: lastName,
      username,
    })
    .eq('id', userId);
  if (error) throw error;

  return data;
};

export default function useUpdateUser(
  firstName: string,
  lastName: string,
  username: string,
  base64Image: string
) {
  const queryClient = useQueryClient();
  const user = supabase.auth.user();

  return useMutation(
    () =>
      updateUser(user?.id ?? '', firstName, lastName, username, base64Image),
    {
      onSuccess: () => {
        queryClient.refetchQueries('user');
      },
    }
  );
}
