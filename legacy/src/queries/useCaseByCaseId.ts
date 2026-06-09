import { User } from '@supabase/supabase-js';
import { useQuery } from 'react-query';
import supabase from '../lib/supabase';
import { Case, Task } from '../types';
import toCamelCase from '../utils/toCamelCase';

const fetchCaseByCaseId = async (caseId: number) => {
  const { data, error } = await supabase
    .from('cases')
    .select(
      `
      id,
      title,
      color,
      emoji
      `
    )
    .eq('id', caseId);
  if (error) {
    throw error;
  }
  return toCamelCase(data![0]);
};

export default function useCaseByCaseId(caseId: number) {
  return useQuery<Case>(['case', caseId], () => fetchCaseByCaseId(caseId));
}
