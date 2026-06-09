import { useQuery } from 'react-query';
import supabase from '../lib/supabase';
import { User } from '../types';
import toCamelCase from '../utils/toCamelCase';

const searchUsers = async (userId: string, query: string) => {
  if (query === '') {
    return [];
  }

  const { data, error } = await supabase
    .from('users')
    .select(
      `
        id,
        first_name,
        last_name,
        username,
        avatar_url,
        push_token
      `
    )
    .textSearch('username', `${query}:*`) // prefix matching
    .limit(10);

  if (error) {
    throw error;
  }
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

  if (data) {
    data.forEach((user, i) => {
      const userRelationship = relationships.find(
        (relationship: any) =>
          relationship.userOneId === user.id ||
          relationship.userTwoId === user.id
      );
      if (userRelationship) {
        if (userRelationship.userOneId === user.id) {
          if (userRelationship.status.includes('pending_one_two')) {
            data[i].relationshipStatus = 'received';
          } else if (userRelationship.status.includes('pending_two_one')) {
            data[i].relationshipStatus = 'sent';
          } else {
            data[i].relationshipStatus = userRelationship.status;
          }
        } else if (userRelationship.userTwoId === user.id) {
          if (userRelationship.status.includes('pending_one_two')) {
            data[i].relationshipStatus = 'sent';
          } else if (userRelationship.status.includes('pending_two_one')) {
            data[i].relationshipStatus = 'received';
          } else {
            data[i].relationshipStatus = userRelationship.status;
          }
        }
      } else {
        data[i].relationshipStatus = 'none';
      }
    });
  }
  const searchedUsers = data?.filter((user) => user.id !== userId);
  return toCamelCase(searchedUsers);
};

export default function useSearchUsers(query: string) {
  const user = supabase.auth.user();
  return useQuery<User[]>(['searchedUsers', query], () =>
    searchUsers(user?.id ?? '', query)
  );
}
