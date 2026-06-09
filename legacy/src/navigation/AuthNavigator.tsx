import React from 'react';
import SignInStack from './SignInStack';
import SignOutStack from './SignOutStack';
import { useUser } from '../providers/UserContext';
import useNotificationsListener from '../hooks/useNotificationsListener';

export default function AuthNavigator() {
  const { user, loadingAuthState } = useUser();
  useNotificationsListener();

  if (loadingAuthState) {
    return null;
  }
  return user !== null ? <SignInStack /> : <SignOutStack />;
}
