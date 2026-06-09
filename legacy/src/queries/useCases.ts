import { useQuery } from 'react-query';
import supabase from '../lib/supabase';
import { Case } from '../types';
import toCamelCase from '../utils/toCamelCase';

const fetchCases = async (userId: string) => {
  const { data, error } = await supabase
    .from('cases')
    .select(
      `
    id,
    title,
    emoji,
    color,
    users_cases (
      users (
        id,
        avatar_url,
        first_name,
        last_name,
        username,
        push_token
      )
    )
  `
    )
    .eq('created_by', userId)
    .order('index', { ascending: true });
  if (error) {
    throw error;
  }
  return toCamelCase(data);
};

export default function useCases() {
  const user = supabase.auth.user();
  return useQuery<Case[]>('cases', () => fetchCases(user?.id ?? ''));
}
