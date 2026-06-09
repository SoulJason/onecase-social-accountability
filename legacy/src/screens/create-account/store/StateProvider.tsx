import React, { createContext, useContext, useReducer } from 'react';
import { Action } from './actions';

export interface IState {
  firstName?: string;
  lastName?: string;
  username?: string;
  password?: string;
  phone?: string | null;
  email?: string | null;
}

interface IContextProps {
  state: IState;
  dispatch: (action: Action) => void;
}

export const StateContext = createContext({} as IContextProps);

interface StateProviderProps {
  reducer: (state: IState, action: Action) => IState;
  initialState: IState;
  children: React.ReactNode;
}

export const StateProvider = ({
  reducer,
  initialState,
  children,
}: StateProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateValue = () => useContext(StateContext);
