/**
 * Luna — Auth Service
 * Stores and retrieves WYA JWT tokens and session from localStorage.
 */

import { UserSession, mapUserSession } from '../types';

const TOKEN_KEY   = 'luna_wya_token';
const SESSION_KEY = 'luna_wya_session';

export const getAuthToken = (): string | null =>
  localStorage.getItem(TOKEN_KEY);

export const getSavedSession = (): UserSession | null => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
};

/** Called after a successful WYA login. user is the raw WYA user object. */
export const saveSession = (token: string, user: Record<string, any>) => {
  localStorage.setItem(TOKEN_KEY, token);
  const session = mapUserSession(token, user);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
};

/** Returns true if a non-expired JWT is stored. */
export const isLoggedIn = (): boolean => {
  const token = getAuthToken();
  if (!token) return false;
  try {
    const payload = token.split('.')[1];
    if (!payload) return false;
    const { exp } = JSON.parse(atob(payload));
    // WYA JWT exp is Unix seconds; Date.now() is ms
    return typeof exp === 'number' && exp * 1000 > Date.now();
  } catch {
    return false;
  }
};
