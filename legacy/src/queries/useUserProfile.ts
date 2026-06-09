import { useQuery } from 'react-query';
import supabase from '../lib/supabase';
import { Case, User } from '../types';
import toCamelCase from '../utils/toCamelCase';

const fetchUserProfile = async (currentUserId: string, userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select(
      `
      id,
      first_name,
      last_name,
      username,
      avatar_url,
      push_token,
      assigned_tasks_case:cases!cases_created_by_fkey (
        id,
        title,
        emoji,
        color
      )
     `
    )
    .eq('id', userId)
    .eq('cases.title', 'Assigned Tasks');
  if (error) {
    throw error;
  }
  const user = {
    ...data![0],
    assignedTasksCase: data![0].assigned_tasks_case
      ? data![0].assigned_tasks_case[0]
      : null,
  };
  delete user.assigned_tasks_case;

  // Determine current user's relationship to fetched user
  const { data: d, error: err } = await supabase
    .from('user_relationships')
    .select(
      `
    user_one_id,
    user_two_id,
    status
  `
    )
    .or(`user_one_id.eq.${userId},user_two_id.eq.${userId}`);

  if (err) {
    throw err;
  }
  const relationships = toCamelCase(d);

  const userRelationship = relationships.find(
    (relationship: any) =>
      (relationship.userOneId === user.id &&
        relationship.userTwoId === currentUserId) ||
      (relationship.userTwoId === user.id &&
        relationship.userOneId === currentUserId)
  );
  if (userRelationship) {
    if (
      userRelationship.userOneId === user.id &&
      userRelationship.userTwoId === currentUserId
    ) {
      if (userRelationship.status.includes('pending_one_two')) {
        user.relationshipStatus = 'received';
      } else if (userRelationship.status.includes('pending_two_one')) {
        user.relationshipStatus = 'sent';
      } else {
        user.relationshipStatus = userRelationship.status;
      }
    } else if (
      userRelationship.userTwoId === user.id &&
      userRelationship.userOneId === currentUserId
    ) {
      if (userRelationship.status.includes('pending_one_two')) {
        user.relationshipStatus = 'sent';
      } else if (userRelationship.status.includes('pending_two_one')) {
        user.relationshipStatus = 'received';
      } else {
        user.relationshipStatus = userRelationship.status;
      }
    } else {
      user.relationshipStatus = 'none';
    }
  } else {
    user.relationshipStatus = 'none';
  }
  return toCamelCase(user);
};

interface UserData {
  assignedTasksCase: Case | null;
}

type UserProfile = User & UserData;

export default function useUserProfile(userId: string) {
  const user = supabase.auth.user();
  return useQuery<UserProfile>(['user', userId], () =>
    fetchUserProfile(user?.id ?? '', userId)
  );
}
