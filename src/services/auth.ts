/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserSession } from '../types';

const TOKEN_KEY = 'luna_wya_token';
const SESSION_KEY = 'luna_wya_session';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getSavedSession = (): UserSession | null => {
  const sessionStr = localStorage.getItem(SESSION_KEY);
  if (!sessionStr) return null;
  try {
    return JSON.parse(sessionStr);
  } catch {
    return null;
  }
};

export const saveSession = (token: string, user: { email: string; profileName: string; styleArchetype: string }) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ ...user, token }));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
};

export const isLoggedIn = (): boolean => {
  const token = getAuthToken();
  if (!token) return false;
  try {
    const payloadBase64 = token.split('.')[1] || token;
    const decoded = JSON.parse(atob(payloadBase64));
    return decoded.exp > Date.now();
  } catch {
    return false;
  }
};
