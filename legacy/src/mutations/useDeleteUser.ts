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
const deleteUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);
  if (error) throw error;

  return data;
};

export default function useDeleteUser() {
  const queryClient = useQueryClient();
  const user = supabase.auth.user();

  return useMutation(() => deleteUser(user?.id ?? ''));
}
