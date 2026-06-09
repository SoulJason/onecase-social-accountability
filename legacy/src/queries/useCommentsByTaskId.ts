import { useQuery } from 'react-query';
import supabase from '../lib/supabase';
import { Comment } from '../types';
import toCamelCase from '../utils/toCamelCase';

const fetchCommentsByTaskId = async (taskId: number) => {
  const { data, error } = await supabase
    .from('task_comments')
    .select(
      `
      *,
      user:users!task_comments_created_by_fkey (
        id,
        first_name,
        last_name,
        username,
        avatar_url
      )
    `
    )
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });
  if (error) {
    throw error;
  }
  return toCamelCase(data);
};

export default function useCommentsByTaskId(taskId: number) {
  return useQuery<Comment[]>(['comments', taskId], () =>
    fetchCommentsByTaskId(taskId)
  );
}
