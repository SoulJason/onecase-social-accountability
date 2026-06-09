import { useQuery } from 'react-query';
import supabase from '../lib/supabase';
import { Case, CouncilUpdate } from '../types';
import removeCurrentUser from '../utils/removeCurrentUser';
import toCamelCase from '../utils/toCamelCase';

const fetchCouncilUpdates = async (userId: string) => {
  // FETCH TASKS THAT THE CURRENT USER ASSIGNED
  const { data: assignedTasksData, error: err } = await supabase
    .from('tasks')
    .select(
      `
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
      ),
      assigned_tasks_case:cases!tasks_case_id_fkey (
        id,
        title,
        emoji,
        color
      ),
      user:users!tasks_assigned_to_fkey (
        id,
        first_name,
        last_name,
        username,
        avatar_url,
        push_token
      )
  `
    )
    .eq('created_by', userId)
    .not('assigned_to', 'eq', userId)
    .order('created_at', {
      foreignTable: 'updates',
      ascending: false,
    });

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
          updates (
            id,
            old_progress,
            new_progress,
            time_spent,
            total_time,
            created_at
          )
        )
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', {
      foreignTable: 'cases.tasks.updates',
      ascending: false,
    })
    .limit(5, { foreignTable: 'cases.tasks.updates' });
  // let { data, error } = await supabase
  //   .from('user_relationships')
  //   .select(
  //     `
  //     user_one:users!user_relationships_user_one_id_fkey (
  //       id,
  //       first_name,
  //       last_name,
  //       username,
  //       avatar_url,
  //       updates (
  //         id,
  //         title,
  //         old_progress,
  //         new_progress,
  //         created_at,
  //         tasks (
  //           id,
  //           title
  //         )
  //       )
  //     ),
  //     user_two:users!user_relationships_user_two_id_fkey (
  //       id,
  //       first_name,
  //       last_name,
  //       username,
  //       avatar_url,
  //       updates (
  //         id,
  //         title,
  //         old_progress,
  //         new_progress,
  //         created_at,
  //         tasks (
  //           id,
  //           title
  //         )
  //       )
  //     )
  //   `
  //   )
  //   .or(`user_one_id.eq.${userId},user_two_id.eq.${userId}`)
  //   .eq('status', 'friends')
  //   .or(`user_id.eq.${userId},user_id.eq.${userId}`, {foreignTable: 'user_one.updates.tasks.cases.users_cases'})
  //   .order('created_at', { foreignTable: 'user_one.updates', ascending: false })
  //   .order('created_at', { foreignTable: 'user_two.updates', ascending: false })
  //   .limit(5, { foreignTable: 'user_one.updates' })
  //   .limit(5, { foreignTable: 'user_two.updates' });
  if (error) {
    throw error;
  }
  // console.log('DATA', data);
  let councilUpdates: CouncilUpdate[] = [];
  if (data) {
    data.forEach((d) => {
      const { case: caseItem } = d;
      const { user } = caseItem;
      caseItem.tasks.forEach((task: any) => {
        task.updates.forEach((update: any) => {
          councilUpdates.push({
            userId: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username,
            avatarUrl: user.avatar_url,
            pushToken: user.push_token,
            taskId: task.id,
            taskTitle: task.title,
            updateId: update.id,
            createdAt: update.created_at,
            oldProgress: update.old_progress,
            newProgress: update.new_progress,
            timeSpent: update.time_spent,
            totalTime: update.total_time,
          });
        });
      });
    });
  }
  if (assignedTasksData) {
    assignedTasksData.forEach((assignedTask) => {
      const user = assignedTask.user;
      assignedTask.updates.forEach((update: any) => {
        councilUpdates.push({
          userId: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          avatarUrl: user.avatar_url,
          pushToken: user.push_token,
          taskId: assignedTask.id,
          taskTitle: assignedTask.title,
          updateId: update.id,
          createdAt: update.created_at,
          oldProgress: update.old_progress,
          newProgress: update.new_progress,
          timeSpent: update.time_spent,
          totalTime: update.total_time,
        });
      });
    });
  }
  councilUpdates = councilUpdates.filter(
    (arr, index, self) =>
      index === self.findIndex((t) => t.updateId === arr.updateId)
  );
  councilUpdates = councilUpdates.sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
  );
  return councilUpdates;
};

export default function useCouncilUpdates() {
  const user = supabase.auth.user();
  return useQuery<CouncilUpdate[]>('councilUpdates', () =>
    fetchCouncilUpdates(user?.id ?? '')
  );
}
