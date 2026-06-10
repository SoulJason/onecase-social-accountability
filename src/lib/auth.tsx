import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "./supabase";

type AuthState = {
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({ session: null, loading: true });

export function AuthProvider({ children }: PropsWithChildren) {
  const qc = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    // Restore any existing session on launch.
    supabase.auth.getSession().then(({ data }) => {
      lastUserId.current = data.session?.user?.id ?? null;
      setSession(data.session);
      setLoading(false);
    });

    // Keep state in sync with sign-in / sign-out events.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const nextId = nextSession?.user?.id ?? null;
      if (nextId !== lastUserId.current) {
        // Account changed (sign-out or a different sign-in): drop every cached
        // query so no data from the previous account leaks into this session.
        qc.clear();
        lastUserId.current = nextId;
      }
      setSession(nextSession);
    });

    return () => sub.subscription.unsubscribe();
  }, [qc]);

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
