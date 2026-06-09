import { useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import supabase from '../lib/supabase';
import { Case, Notification } from '../types';
import toCamelCase from '../utils/toCamelCase';

const fetchNotificationCount = async (userId: string) => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId);
  if (error) {
    throw error;
  }
  return count ?? 0;
};

export default function useNotificationCount() {
  const user = supabase.auth.user();

  return useQuery<number>('notificationCount', () =>
    fetchNotificationCount(user?.id ?? '')
  );
}
