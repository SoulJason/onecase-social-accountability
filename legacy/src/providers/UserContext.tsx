import React, { useEffect, useState, createContext, useContext } from 'react';
import { Session, Subscription } from '@supabase/supabase-js';
import supabase from '../lib/supabase';
import { fetchUser } from '../lib/supabase/store';
import { User } from '../types';
import useCurrentUser from '../queries/useCurrentUser';

export const UserContext = createContext<{
  user: User | null;
  session: Session | null;
  loadingAuthState: boolean;
}>({
  user: null,
  session: null,
  loadingAuthState: true,
});

export const UserContextProvider = (props: any) => {
  const [session, setSession] = useState<Session | null>(
    supabase.auth.session()
  );
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuthState, setLoadingAuthState] = useState(true);
  const {
    data: userInfo,
    isLoading,
    isRefetching,
  } = useCurrentUser(
    session?.user?.phone as string,
    session?.user?.email as string
  );

  useEffect(() => {
    let authListener: Subscription | null = null;
    (async () => {
      if (!isLoading) {
        const userObject = { ...session?.user, ...userInfo } as User;
        if (Object.keys(userObject).length > 0) {
          setUser(userObject);
        }
        let { data } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log(`Supabase auth event: ${event}`);
            if (event === 'SIGNED_IN') {
              setSession(session);
              setUser(({ ...session?.user, ...userInfo } as User) ?? null);
              // setLoadingAuthState(false);
            } else if (event === 'SIGNED_OUT') {
              setSession(null);
              setUser(null);
              // setLoadingAuthState(false);
            }
          }
        );
        authListener = data;
        setLoadingAuthState(false);
      }
    })();
    return () => {
      if (authListener) {
        authListener.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const value = {
    session,
    user,
    loadingAuthState,
  };
  return <UserContext.Provider value={value} {...props} />;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a UserContextProvider.`);
  }
  return context;
};
