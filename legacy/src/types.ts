import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User extends SupabaseUser {
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl?: string;
  updatedAt?: Date;
  profileCreated: boolean;
  status?: 'ONLINE' | 'OFFLINE';
  relationshipStatus?: 'none' | 'sent' | 'received' | 'friends' | 'blocked';
  selected: boolean;
  pushToken?: string;
  resetPassword?: boolean;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  image: string;
  progress: number;
  createdBy: string;
  assignedTo: string;
  caseId: number;
  updates?: Update[];
  // props that certain hooks may use
  assigner?: User;
}

export interface Comment {
  id: number;
  createdAt: string;
  createdBy: string;
  message: string;
  taskId: number;
  parentId?: number | null;
  user: User;
}

export interface Update {
  id: number;
  createdAt: string; // ISO string
  oldProgress: number;
  newProgress: number;
  timeSpent: number;
  totalTime: number;
}

export interface Case {
  id: number;
  owner: string;
  index: number;
  title: string;
  emoji: string;
  color: string;
  tasks: Task[];
  council: string[];
  usersCases?: {
    users?: User;
  }[];
  comments?: Comment[];
}

export interface Comment {
  id: number;
  inserted_at: Date;
  comment: string;
  userId: string;
  caseId: string;
}

export interface CaseUpdateItem {
  userId: string;
  pushToken: string;
  task: Task;
  oldProgress: number;
  newProgress: number;
  timeSpent: number;
  totalTime: number;
  createdAt: string;
}

export interface CaseUpdate {
  id: number;
  title: string;
  emoji: string;
  color: string;
  progress: number;
  updates: CaseUpdateItem[];
}

export interface CouncilUpdate {
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string;
  pushToken: string;
  taskId: number;
  taskTitle: string;
  updateId: number;
  createdAt: string;
  oldProgress: number;
  newProgress: number;
  timeSpent: number;
  totalTime: number;
}

export interface LiveUpdate {
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string;
  pushToken: string;
  taskId: number;
  taskTitle: string;
  taskProgress: number;
  clockInId: number;
  createdAt: string;
  totalTime: number;
  isLive: boolean;
}

export interface ClockIn {
  id: number;
  createdAt: string;
  createdBy: string;
  endTime: string;
  totalTime: number;
  isLive: boolean;
  taskId: number;
}

export type NotificationType =
  | 'assign_task'
  | 'add_council'
  | 'accept_council'
  | 'add_friend'
  | 'accept_friend'
  | 'nudge'
  | 'comment'
  | 'comment_reply';

export interface Notification {
  id: number;
  senderId: string;
  receiverId: string;
  type: NotificationType;
  createdAt: string;
  isUnread: boolean;
  caseId?: number;
  taskId?: number;
  taskCommentId?: number;
  count?: number;
}

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  phoneNumberDigits: string;
}
