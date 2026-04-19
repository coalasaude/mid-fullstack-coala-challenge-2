import type { AuthUser } from '@/shared/types';

const TOKEN_KEY = 'healthflow.token';
const USER_KEY = 'healthflow.user';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export const authStorage = {
  getToken(): string | null {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  getUser(): AuthUser | null {
    if (!isBrowser()) return null;
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },
  setSession(user: AuthUser, token: string): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear(): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  },
};
