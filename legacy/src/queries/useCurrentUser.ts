import { useQuery } from 'react-query';
import supabase from '../lib/supabase';
import { User } from '../types';
import toCamelCase from '../utils/toCamelCase';

const fetchUser = async (userId: string, phone: string, email: string) => {
  let data;
  if (phone !== '') {
    ({ data } = await supabase
      .from<User>('users')
      .select('*')
      .eq('phone', phone));
  } else if (email !== '') {
    ({ data } = await supabase
      .from<User>('users')
      .select('*')
      .eq('email', email));
  } else if (userId !== '') {
    ({ data } = await supabase.from('users').select('*').eq('id', userId));
  } else {
    return null;
  }
  return toCamelCase(data![0]);
};

export default function useCurrentUser(phone?: string, email?: string) {
  const user = supabase.auth.user();

  return useQuery<User>(['user', { phone, email }], () =>
    fetchUser(user?.id ?? '', phone ?? '', email ?? '')
  );
}
