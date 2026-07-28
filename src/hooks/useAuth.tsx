import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';
import type { Profile, UserRole } from '@/services/types';
import { fetchProfile, updateProfile } from '@/services/api';

interface AuthCtx {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  role: UserRole | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateMe: (patch: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    let p = await fetchProfile(userId);
    // The handle_new_user trigger runs AFTER auth.users insert; on a fresh signup
    // the profile row may not be visible yet. Retry briefly.
    if (!p) {
      for (let i = 0; i < 5 && !p; i++) {
        await new Promise((r) => setTimeout(r, 300));
        p = await fetchProfile(userId);
      }
    }
    setProfile(p);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        loadProfile(data.session.user.id).finally(() => mounted && setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      (async () => {
        setSession(sess);
        if (sess?.user) {
          await loadProfile(sess.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, fullName: string, role: UserRole) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role } },
      });
      if (error) throw error;
      // Best-effort: set role on the profile row created by the trigger.
      if (data.user) {
        await new Promise((r) => setTimeout(r, 500));
        await updateProfile(data.user.id, { full_name: fullName, role });
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }, []);

  const updateMe = useCallback(
    async (patch: Partial<Profile>) => {
      if (!session?.user) return;
      const updated = await updateProfile(session.user.id, patch);
      setProfile(updated);
    },
    [session],
  );

  const value: AuthCtx = {
    session,
    profile,
    loading,
    role: profile?.role ?? null,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    updateMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
