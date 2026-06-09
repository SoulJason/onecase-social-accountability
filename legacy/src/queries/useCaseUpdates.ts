import { useQuery } from 'react-query';
import supabase from '../lib/supabase';
import { CaseUpdate, CaseUpdateItem } from '../types';
import toCamelCase from '../utils/toCamelCase';

const fetchCaseUpdates = async (userId: string) => {
  const { data, error } = await supabase
    .from('cases')
    .select(
      `
        id,
        title,
        emoji,
        color,
        tasks!tasks_case_id_fkey (
          id,
          title,
          description,
          progress,
          created_at,
          created_by,
          assigned_to,
          updates (
            id,
            old_progress,
            new_progress,
            time_spent,
            total_time,
            created_at
          )
        ),
        user:users!cases_created_by_fkey (
          id,
          push_token
        )
      `
    )
    .eq('created_by', userId)
    .not('tasks.assigned_to', 'is', null)
    .order('created_at', { foreignTable: 'tasks.updates', ascending: false })
    .limit(2, { foreignTable: 'tasks.updates' });
  if (error) {
    throw error;
  }
  let caseUpdates: CaseUpdate[] = [];
  if (data) {
    caseUpdates = data.map((item: any) => {
      let caseUpdate: any = { ...item, updates: [] };
      item.tasks.forEach((task: any) => {
        if (task.updates.length === 0) {
          caseUpdate.updates.push({
            userId: item.user.id,
            pushToken: item.user.push_token,
            task: {
              id: task.id,
              title: task.title,
              description: task.description,
              progress: task.progress,
              created_at: task.created_at,
              created_by: task.created_by,
              assigned_to: task.assigned_to,
            },
            oldProgress: task.progress,
            newProgress: task.progress,
            timeSpent: 0,
            totalTime: 0,
            createdAt: task.created_at,
          });
        } else {
          const mostRecentUpdate = task.updates[0];
          caseUpdate.updates.push({
            userId: item.user.id,
            pushToken: item.user.push_token,
            task: {
              id: task.id,
              title: task.title,
              description: task.description,
              progress: task.progress,
              created_at: task.created_at,
              created_by: task.created_by,
              assigned_to: task.assigned_to,
            },
            oldProgress: mostRecentUpdate.old_progress,
            newProgress: mostRecentUpdate.new_progress,
            timeSpent: mostRecentUpdate.time_spent,
            totalTime: mostRecentUpdate.total_time,
            createdAt: mostRecentUpdate.created_at,
          });
        }
      });
      delete caseUpdate.tasks;
      delete caseUpdate.user;
      return caseUpdate;
    });
  }
  caseUpdates.forEach((caseUpdate: CaseUpdate) => {
    caseUpdate.updates = caseUpdate.updates.sort(
      (a: CaseUpdateItem, b: CaseUpdateItem) =>
        Date.parse(b.createdAt) - Date.parse(a.createdAt)
    );
    caseUpdate.updates = caseUpdate.updates.slice(0, 2);
  });
  return toCamelCase(caseUpdates);
};

export default function useCaseUpdates() {
  const user = supabase.auth.user();
  return useQuery<CaseUpdate[]>('caseUpdates', () =>
    fetchCaseUpdates(user?.id ?? '')
  );
}
