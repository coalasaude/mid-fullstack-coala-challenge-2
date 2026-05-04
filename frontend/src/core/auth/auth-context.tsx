'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from './auth-storage';
import { ERole, type AuthUser } from '@/shared/types';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  setSession: (user: AuthUser, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = authStorage.getUser();
    const storedToken = authStorage.getToken();
    if (storedUser && storedToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating auth from localStorage (browser-only) on first mount
      setUser(storedUser);
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const setSession = useCallback((nextUser: AuthUser, nextToken: string) => {
    authStorage.setSession(nextUser, nextToken);
    setUser(nextUser);
    setToken(nextToken);
  }, []);

  const logout = useCallback(() => {
    authStorage.clear();
    setUser(null);
    setToken(null);
    router.replace('/login');
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, setSession, logout }),
    [user, token, loading, setSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function dashboardPathFor(role: ERole): string {
  return role === ERole.DOCTOR ? '/dashboard/doctor' : '/dashboard/attendant';
}
