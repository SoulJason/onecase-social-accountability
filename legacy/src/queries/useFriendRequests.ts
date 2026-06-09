import { useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import supabase from '../lib/supabase';
import { Case, Notification } from '../types';
import toCamelCase from '../utils/toCamelCase';

const fetchFriendRequests = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select(
      `
      *
    `
    )
    .match({
      receiver_id: userId,
      type: 'add_friend',
    })
    .order('created_at', { ascending: true });
  if (error) {
    throw error;
  }
  return toCamelCase(data);
};

export default function useFriendRequests() {
  const user = supabase.auth.user();

  return useQuery<Notification[]>(['notifications', 'add_friend'], () =>
    fetchFriendRequests(user?.id ?? '')
  );
}
