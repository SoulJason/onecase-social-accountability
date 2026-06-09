import { useQuery } from 'react-query';
import supabase from '../lib/supabase';
import { User, Case, Task, Comment } from '../types';
import toCamelCase from '../utils/toCamelCase';

const fetchTaskByTaskId = async (taskId: number) => {
  const { data, error } = await supabase
    .from('tasks')
    .select(
      `
        id,
        title,
        description,
        progress,
        created_by,
        assigned_to,
        case_id,
        caseItem:cases!tasks_case_id_fkey (
          title,
          color,
          emoji
        ),
        assigner:users!tasks_created_by_fkey (
          id,
          first_name,
          avatar_url
        ),
        assignee:users!tasks_assigned_to_fkey (
          id,
          first_name,
          avatar_url
        ),
        comments:task_comments!task_comments_task_id_fkey (
          *,
          user:users!task_comments_created_by_fkey (
            id,
            first_name,
            last_name,
            username,
            avatar_url
          )
        )
      `
    )
    .eq('id', taskId)
    .order('created_at', { foreignTable: 'comments', ascending: false })
    .limit(2, { foreignTable: 'comments' });
  if (error) {
    throw error;
  }
  console.log('TASK', data![0]);
  return toCamelCase(data![0]);
};

interface UserData {
  caseItem: Case;
  assigner: User | null;
  assignee: User;
  comments: Comment[];
}

type TaskItem = Task & UserData;

export default function useTaskByTaskId(taskId: number) {
  return useQuery<TaskItem>(['task', taskId], () => fetchTaskByTaskId(taskId));
}
