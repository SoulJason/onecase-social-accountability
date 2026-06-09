import { useQuery } from 'react-query';
import supabase from '../lib/supabase';
import { Case, ClockIn, LiveUpdate } from '../types';
import toCamelCase from '../utils/toCamelCase';

const fetchClockIns = async (userId: string) => {
  const { data, error } = await supabase
    .from('users_cases')
    .select(
      `
      case:cases (
        user:users!cases_created_by_fkey (
          id,
          first_name,
          last_name,
          username,
          avatar_url,
          push_token
        ),
        tasks!tasks_case_id_fkey (
          id,
          title,
          description,
          progress,
          created_at,
          created_by,
          clock_ins (
            *
          )
        )
      )
    `
    )
    .eq('user_id', userId)
    .eq('cases.tasks.clock_ins.is_live', true)
    .order('created_at', {
      foreignTable: 'cases.tasks.clock_ins',
      ascending: false,
    });
  let liveUpdates: LiveUpdate[] = [];
  if (data) {
    data.forEach((d) => {
      const { case: caseItem } = d;
      const { user } = caseItem;
      caseItem.tasks.forEach((task: any) => {
        task.clock_ins.forEach((clockIn: any) => {
          liveUpdates.push({
            userId: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username,
            avatarUrl: user.avatar_url,
            pushToken: user.push_token,
            taskId: task.id,
            taskTitle: task.title,
            taskProgress: task.progress,
            clockInId: clockIn.id,
            createdAt: clockIn.created_at,
            totalTime: clockIn.total_time,
            isLive: clockIn.is_live,
          });
        });
      });
    });
  }
  if (error) {
    throw error;
  }
  return toCamelCase(liveUpdates);
};

export default function useClockIns() {
  const user = supabase.auth.user();
  return useQuery<LiveUpdate[]>('liveUpdates', () =>
    fetchClockIns(user?.id ?? '')
  );
}
