import { useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import supabase from '../lib/supabase';
import { Case, Notification } from '../types';
import toCamelCase from '../utils/toCamelCase';

const fetchNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select(
      `
      *
    `
    )
    .eq('receiver_id', userId)
    .order('created_at', { ascending: true });
  if (error) {
    throw error;
  }
  return toCamelCase(data);
};

export default function useNotifications() {
  const user = supabase.auth.user();

  return useQuery<Notification[]>('notifications', () =>
    fetchNotifications(user?.id ?? '')
  );
}
