import { secureStorage } from '@/core/storage/secureStorage';
import { STORAGE_KEYS } from '@/core/storage/storageKeys';

import type { AuthSession } from './authTypes';

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
  return (await getAuthSession())?.accessToken ?? null;
}
