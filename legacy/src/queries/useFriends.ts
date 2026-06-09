import { useQuery } from 'react-query';
import supabase from '../lib/supabase';
import { User } from '../types';
import removeCurrentUser from '../utils/removeCurrentUser';
import toCamelCase from '../utils/toCamelCase';

const fetchFriends = async (userId: string) => {
  let { data, error } = await supabase
    .from('user_relationships')
    .select(
      `
        status,
        user_one:users!user_relationships_user_one_id_fkey (
          id,
          first_name,
          last_name,
          username,
          avatar_url,
          push_token
        ),
        user_two:users!user_relationships_user_two_id_fkey (
          id,
          first_name,
          last_name,
          username,
          avatar_url,
          push_token
        )
      `
    )
    .or(`user_one_id.eq.${userId},user_two_id.eq.${userId}`)
    .eq('status', 'friends');
  if (error) {
    throw error;
  }

  if (data) {
    data = removeCurrentUser(data, userId);
  }
  return toCamelCase(data);
};

export default function useFriends() {
  const user = supabase.auth.user();
  return useQuery<User[]>('friends', () => fetchFriends(user?.id ?? ''));
}
