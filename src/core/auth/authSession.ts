import type { Session } from '@supabase/supabase-js';

import { AppError } from '@/core/errors/AppError';
import { secureStorage } from '@/core/storage/secureStorage';
import { STORAGE_KEYS } from '@/core/storage/storageKeys';

import { getAuthClient } from './authClient';
import type { AuthSession } from './authTypes';

function fromSupabaseSession(session: Session): AuthSession {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    ...(session.expires_at !== undefined ? { expiresAt: session.expires_at } : {}),
    userId: session.user.id,
  };
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const value = await secureStorage.get(STORAGE_KEYS.authSession);
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'accessToken' in parsed &&
      typeof parsed.accessToken === 'string'
    ) {
      return parsed as AuthSession;
    }
  } catch {
    await clearAuthSession();
  }
  return null;
}

export async function saveAuthSession(session: AuthSession): Promise<void> {
  await secureStorage.set(STORAGE_KEYS.authSession, JSON.stringify(session));
}

export async function clearAuthSession(): Promise<void> {
  await secureStorage.remove(STORAGE_KEYS.authSession);
}

export async function getAccessToken(): Promise<string | null> {
  const client = getAuthClient();
  if (client) {
    const { data, error } = await client.auth.getSession();
    if (!error && data.session) {
      return data.session.access_token;
    }
  }
  const stored = await getAuthSession();
  if (stored?.expiresAt && stored.expiresAt <= Math.floor(Date.now() / 1000)) {
    await clearAuthSession();
    return null;
  }
  return stored?.accessToken ?? null;
}

export async function initializeAuthSession(): Promise<AuthSession | null> {
  const client = getAuthClient();
  if (!client) {
    await clearAuthSession();
    return null;
  }
  const current = await client.auth.getSession();
  if (current.error) {
    await clearAuthSession();
    throw new AppError(
      'AUTHENTICATION_REQUIRED',
      'Uwaci could not restore a secure session. Please try again.',
      true,
    );
  }
  if (!current.data.session) return null;
  const normalized = fromSupabaseSession(current.data.session);
  await saveAuthSession(normalized);
  return normalized;
}

/**
 * Resolve a backend-capable session only when the user is about to use a
 * protected feature. Anonymous auth is optional in Supabase projects, so a
 * disabled guest setting becomes an actionable sign-in flow instead of a
 * failed text/voice request.
 */
export async function ensureAuthSession(): Promise<AuthSession> {
  const restored = await initializeAuthSession();
  if (restored) return restored;
  const client = getAuthClient();
  if (!client) {
    throw new AppError(
      'AUTHENTICATION_REQUIRED',
      'Sign in or create an account to start a conversation.',
      true,
    );
  }
  const anonymous = await client.auth.signInAnonymously();
  if (anonymous.error || !anonymous.data.session) {
    throw new AppError(
      'AUTHENTICATION_REQUIRED',
      anonymous.error?.message?.toLowerCase().includes('anonymous')
        ? 'Guest access is disabled for this Uwaci project. Sign in or create an account to continue.'
        : 'Uwaci could not start a secure session. Please sign in or try again.',
      true,
    );
  }
  const normalized = fromSupabaseSession(anonymous.data.session);
  await saveAuthSession(normalized);
  return normalized;
}

export function observeAuthSession(listener: (session: AuthSession | null) => void): () => void {
  const client = getAuthClient();
  if (!client) return () => undefined;
  const { data } = client.auth.onAuthStateChange((_event, session) => {
    if (!session) {
      void clearAuthSession().then(() => listener(null));
      return;
    }
    const normalized = fromSupabaseSession(session);
    void saveAuthSession(normalized).then(() => listener(normalized));
  });
  return () => data.subscription.unsubscribe();
}
