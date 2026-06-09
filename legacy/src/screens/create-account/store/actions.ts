import { IState } from './StateProvider';

export enum ActionType {
  SET_USER = 'set_user',
  REMOVE_USER = 'remove_user',
}

export interface SetUserAction {
  type: ActionType.SET_USER;
  payload: IState;
}

export interface RemoveUserAction {
  type: ActionType.REMOVE_USER;
}

export type Action = SetUserAction | RemoveUserAction;
