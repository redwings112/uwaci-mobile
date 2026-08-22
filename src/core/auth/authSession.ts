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
    // Keep the refresh token until Supabase has had a chance to refresh it when
    // connectivity returns. Removing it here turns a temporary offline resume
    // into an unexpected logout.
    return null;
  }
  return stored?.accessToken ?? null;
}

export async function initializeAuthSession(): Promise<AuthSession | null> {
  const client = getAuthClient();
  if (!client) return getAuthSession();
  const current = await client.auth.getSession();
  if (!current.error && current.data.session) {
    const normalized = fromSupabaseSession(current.data.session);
    await saveAuthSession(normalized);
    return normalized;
  }

  const stored = await getAuthSession();
  if (stored?.refreshToken) {
    // Keep the durable copy in sync with Supabase's own storage. This repairs a
    // partially restored native session and lets the refresh token renew an
    // expired access token after the app comes back to the foreground.
    const restored = await client.auth.setSession({
      access_token: stored.accessToken,
      refresh_token: stored.refreshToken,
    });
    if (!restored.error && restored.data.session) {
      const normalized = fromSupabaseSession(restored.data.session);
      await saveAuthSession(normalized);
      return normalized;
    }
    // A timeout or an offline device must not erase a valid saved account.
    return stored;
  }
  if (stored) return stored;
  if (current.error) {
    throw new AppError(
      'AUTHENTICATION_REQUIRED',
      'Uwaci could not restore a secure session. Please try again.',
      true,
    );
  }
  return null;
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
  const { data } = client.auth.onAuthStateChange((event, session) => {
    if (!session) {
      if (event === 'SIGNED_OUT') {
        void clearAuthSession().then(() => listener(null));
      } else {
        // INITIAL_SESSION can be null while SecureStore restores on native.
        // Preserve the account until Supabase explicitly signs it out.
        void getAuthSession().then(listener);
      }
      return;
    }
    const normalized = fromSupabaseSession(session);
    void saveAuthSession(normalized).then(() => listener(normalized));
  });
  return () => data.subscription.unsubscribe();
}
