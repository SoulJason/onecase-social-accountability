import { useQuery } from 'react-query';
import supabase from '../lib/supabase';
import { Case, CaseUpdate, CaseUpdateItem } from '../types';
import toCamelCase from '../utils/toCamelCase';

const fetchUserProfileUpdates = async (
  currentUserId: string,
  userId: string
) => {
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
        push_token
      )
  `
    )
    .eq('created_by', currentUserId)
    .eq('assigned_to', userId)
    .order('created_at', {
      foreignTable: 'updates',
      ascending: false,
    });
  // .limit(2, { foreignTable: 'updates' });
  if (err) {
    throw err;
  }
  // FETCH THE OTHER TASKS THAT THE CURRENT USER CAN SEE (PART OF COUNCIL)
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
    ),
    users_cases!inner(
      user_id
    )  
  `
    )
    .eq('created_by', userId)
    .eq('tasks.assigned_to', userId)
    .eq('users_cases.user_id', currentUserId)
    .order('created_at', {
      foreignTable: 'tasks.updates',
      ascending: false,
    });
  // .limit(2, { foreignTable: 'tasks.updates' });
  if (error) {
    throw error;
  }
  let caseUpdates: CaseUpdate[] = [];
  let caseItems: Case[] = [];
  if (assignedTasksData && assignedTasksData.length > 0) {
    let assignedTaskCase;
    for (let assignedTask of assignedTasksData) {
      if (
        assignedTask.assigned_tasks_case &&
        assignedTask.assigned_tasks_case.title === 'Assigned Tasks'
      ) {
        assignedTaskCase = assignedTask.assigned_tasks_case;
        break;
      }
    }
    if (assignedTaskCase) {
      let assignedTasks = {
        ...assignedTaskCase,
        updates: [],
      };
      assignedTasksData.forEach((assignedTask: any) => {
        const assignedTaskUpdates: any[] = [];
        if (
          assignedTask.assigned_tasks_case &&
          assignedTask.assigned_tasks_case.title === 'Assigned Tasks'
        ) {
          if (assignedTask.updates.length === 0) {
            assignedTaskUpdates.push({
              userId: assignedTask.user.id,
              pushToken: assignedTask.user.push_token,
              task: {
                id: assignedTask.id,
                title: assignedTask.title,
                description: assignedTask.description,
                progress: assignedTask.progress,
                created_at: assignedTask.created_at,
                created_by: assignedTask.created_by,
                assigned_to: assignedTask.assigned_to,
              },
              oldProgress: assignedTask.progress,
              newProgress: assignedTask.progress,
              timeSpent: 0,
              totalTime: 0,
              createdAt: assignedTask.created_at,
            });
          } else {
            const mostRecentUpdate = assignedTask.updates[0];
            assignedTaskUpdates.push({
              userId: assignedTask.user.id,
              pushToken: assignedTask.user.push_token,
              task: {
                id: assignedTask.id,
                title: assignedTask.title,
                description: assignedTask.description,
                progress: assignedTask.progress,
                created_at: assignedTask.created_at,
                created_by: assignedTask.created_by,
                assigned_to: assignedTask.assigned_to,
              },
              oldProgress: mostRecentUpdate.old_progress,
              newProgress: mostRecentUpdate.new_progress,
              timeSpent: mostRecentUpdate.time_spent,
              totalTime: mostRecentUpdate.total_time,
              createdAt: mostRecentUpdate.created_at,
            });
          }
        }
        assignedTasks.updates =
          assignedTasks.updates.concat(assignedTaskUpdates);
      });
      caseUpdates.push(assignedTasks);
    }
  }
  if (data && data.length > 0) {
    const cases: Case[] = data.map(
      (caseItem: any) =>
        ({
          id: caseItem.id,
          title: caseItem.title,
          emoji: caseItem.emoji,
          color: caseItem.color,
        } as Case)
    );
    caseItems = caseItems.concat(cases);

    caseUpdates = caseUpdates.concat(
      data.map((item: any) => {
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
        delete caseUpdate.users_cases;
        return caseUpdate;
      })
    );
  }
  caseUpdates.forEach((caseUpdate: CaseUpdate) => {
    caseUpdate.updates = caseUpdate.updates.sort(
      (a: CaseUpdateItem, b: CaseUpdateItem) =>
        Date.parse(b.createdAt) - Date.parse(a.createdAt)
    );
    caseUpdate.updates = caseUpdate.updates.slice(0, 2);
  });
  return toCamelCase({
    caseUpdates,
    caseItems,
  });
};

interface UserProfileUpdates {
  caseUpdates: CaseUpdate[];
  caseItems: Case[];
}

export default function useUserProfileUpdates(userId: string) {
  const user = supabase.auth.user();
  return useQuery<UserProfileUpdates>(['userProfileUpdates', userId], () =>
    fetchUserProfileUpdates(user?.id ?? '', userId)
  );
}
