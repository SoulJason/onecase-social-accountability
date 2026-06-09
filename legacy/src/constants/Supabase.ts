import {
  REACT_NATIVE_SUPABASE_URL,
  REACT_NATIVE_SUPABASE_ANON_KEY,
  REACT_NATIVE_SUPABASE_URL_DEV,
  REACT_NATIVE_SUPABASE_ANON_KEY_DEV,
} from '@env';
import isDev from '../utils/isDev';

if (!REACT_NATIVE_SUPABASE_URL && !REACT_NATIVE_SUPABASE_URL_DEV) {
  console.log(
    'Supabase.ts',
    'Make sure you have a `.env` file to populate your variables.'
  );
}

export const SUPABASE_URL =
  (!isDev() ? REACT_NATIVE_SUPABASE_URL : REACT_NATIVE_SUPABASE_URL_DEV) || '';
export const SUPABASE_ANON_KEY =
  (!isDev()
    ? REACT_NATIVE_SUPABASE_ANON_KEY
    : REACT_NATIVE_SUPABASE_ANON_KEY_DEV) || '';
