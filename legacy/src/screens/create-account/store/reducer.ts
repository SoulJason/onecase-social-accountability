import { Action, ActionType } from './actions';
import { IState } from './StateProvider';

export const initialState: IState = {
  firstName: '',
  lastName: '',
  username: '',
  password: '',
  phone: null,
  email: null,
};

//what does behind the scenes when you call dispatch. When you do call dispatch, this reducer handles some
export const reducer = (state: IState = initialState, action: Action) => {
  switch (action.type) {
    case ActionType.SET_USER: {
      state = { ...state, ...action.payload };
      return state;
    }
    case ActionType.REMOVE_USER: {
      state = initialState;
      return state;
    }
    default:
      return state;
  }
};
