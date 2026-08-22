import type { Session, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

import { getAuthClient } from '@/core/auth/authClient';
import {
  clearAuthSession,
  ensureAuthSession,
  getAccessToken,
  getAuthSession,
  initializeAuthSession,
  observeAuthSession,
  saveAuthSession,
} from '@/core/auth/authSession';
import type { AuthSession } from '@/core/auth/authTypes';
import { STORAGE_KEYS } from '@/core/storage/storageKeys';

jest.mock('@/core/auth/authClient', () => ({ getAuthClient: jest.fn() }));

interface AuthClientMock {
  auth: {
    getSession: jest.Mock;
    setSession: jest.Mock;
    onAuthStateChange: jest.Mock;
    signInAnonymously: jest.Mock;
  };
}

const storedSession: AuthSession = {
  accessToken: 'stored-access',
  refreshToken: 'stored-refresh',
  expiresAt: 2_000_000_000,
  userId: 'stored-user',
};

function createSupabaseSession(overrides: Partial<Session> = {}): Session {
  return {
    access_token: 'remote-access',
    refresh_token: 'remote-refresh',
    expires_at: 2_000_000_000,
    expires_in: 3600,
    token_type: 'bearer',
    user: { id: 'remote-user' },
    ...overrides,
  } as Session;
}

function createClient(): AuthClientMock {
  const client: AuthClientMock = {
    auth: {
      getSession: jest.fn(),
      setSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signInAnonymously: jest.fn(),
    },
  };
  jest.mocked(getAuthClient).mockReturnValue(client as unknown as SupabaseClient);
  return client;
}

async function flushPromises(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('authentication session lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getAuthClient).mockReturnValue(null);
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(null);
    jest.mocked(SecureStore.setItemAsync).mockResolvedValue(undefined);
    jest.mocked(SecureStore.deleteItemAsync).mockResolvedValue(undefined);
  });

  it('reads, saves, and clears a valid stored session', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(JSON.stringify(storedSession));

    await expect(getAuthSession()).resolves.toEqual(storedSession);
    await saveAuthSession(storedSession);
    await clearAuthSession();

    expect(SecureStore.getItemAsync).toHaveBeenCalledWith(STORAGE_KEYS.authSession);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      STORAGE_KEYS.authSession,
      JSON.stringify(storedSession),
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(STORAGE_KEYS.authSession);
  });

  it('clears malformed stored session JSON', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue('{not-json');

    await expect(getAuthSession()).resolves.toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(STORAGE_KEYS.authSession);
  });

  it('ignores stored objects without an access token', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(JSON.stringify({ userId: 'user' }));

    await expect(getAuthSession()).resolves.toBeNull();
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it('prefers the active Supabase access token', async () => {
    const client = createClient();
    client.auth.getSession.mockResolvedValue({
      data: { session: createSupabaseSession() },
      error: null,
    });

    await expect(getAccessToken()).resolves.toBe('remote-access');
    expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
  });

  it('falls back to an unexpired stored access token', async () => {
    const client = createClient();
    client.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: new Error('offline'),
    });
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(JSON.stringify(storedSession));

    await expect(getAccessToken()).resolves.toBe('stored-access');
  });

  it('keeps an expired stored session for a later refresh', async () => {
    jest
      .mocked(SecureStore.getItemAsync)
      .mockResolvedValue(JSON.stringify({ ...storedSession, expiresAt: 1 }));

    await expect(getAccessToken()).resolves.toBeNull();
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalledWith(STORAGE_KEYS.authSession);
  });

  it('leaves local state untouched when authentication is not configured', async () => {
    await expect(initializeAuthSession()).resolves.toBeNull();
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalledWith(STORAGE_KEYS.authSession);
  });

  it('rejects a failed session restore without deleting local state', async () => {
    const client = createClient();
    client.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: new Error('restore failed'),
    });

    await expect(initializeAuthSession()).rejects.toMatchObject({
      code: 'AUTHENTICATION_REQUIRED',
      retryable: true,
    });
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalledWith(STORAGE_KEYS.authSession);
  });

  it('normalizes and persists an existing Supabase session', async () => {
    const client = createClient();
    client.auth.getSession.mockResolvedValue({
      data: { session: createSupabaseSession() },
      error: null,
    });

    await expect(initializeAuthSession()).resolves.toEqual({
      accessToken: 'remote-access',
      refreshToken: 'remote-refresh',
      expiresAt: 2_000_000_000,
      userId: 'remote-user',
    });
    expect(SecureStore.setItemAsync).toHaveBeenCalled();
    expect(client.auth.signInAnonymously).not.toHaveBeenCalled();
  });

  it('leaves a missing session anonymous during application bootstrap', async () => {
    const client = createClient();
    client.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });

    await expect(initializeAuthSession()).resolves.toBeNull();
    expect(client.auth.signInAnonymously).not.toHaveBeenCalled();
  });

  it('keeps a saved account while Supabase recovers from an offline restart', async () => {
    const client = createClient();
    client.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: new Error('network request failed'),
    });
    client.auth.setSession.mockResolvedValue({
      data: { session: null },
      error: new Error('network request failed'),
    });
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(JSON.stringify(storedSession));

    await expect(initializeAuthSession()).resolves.toEqual(storedSession);
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalledWith(STORAGE_KEYS.authSession);
  });

  it('starts and persists an anonymous session when a protected flow begins', async () => {
    const client = createClient();
    const anonymousSession = createSupabaseSession();
    delete anonymousSession.expires_at;
    client.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    client.auth.signInAnonymously.mockResolvedValue({
      data: { session: anonymousSession },
      error: null,
    });

    await expect(ensureAuthSession()).resolves.toEqual({
      accessToken: 'remote-access',
      refreshToken: 'remote-refresh',
      userId: 'remote-user',
    });
    expect(SecureStore.setItemAsync).toHaveBeenCalled();
  });

  it('turns disabled anonymous access into an actionable sign-in error', async () => {
    const client = createClient();
    client.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    client.auth.signInAnonymously.mockResolvedValue({
      data: { session: null },
      error: new Error('Anonymous sign-ins are disabled'),
    });

    await expect(ensureAuthSession()).rejects.toMatchObject({
      code: 'AUTHENTICATION_REQUIRED',
      retryable: true,
      message: expect.stringContaining('Sign in'),
    });
  });

  it('observes persisted sign-in and sign-out changes and unsubscribes', async () => {
    const client = createClient();
    const unsubscribe = jest.fn();
    let authListener: ((_event: string, session: Session | null) => void) | undefined;
    client.auth.onAuthStateChange.mockImplementation((listener) => {
      authListener = listener;
      return { data: { subscription: { unsubscribe } } };
    });
    const listener = jest.fn();

    const stopObserving = observeAuthSession(listener);
    authListener?.('SIGNED_IN', createSupabaseSession());
    await flushPromises();
    expect(listener).toHaveBeenLastCalledWith({
      accessToken: 'remote-access',
      refreshToken: 'remote-refresh',
      expiresAt: 2_000_000_000,
      userId: 'remote-user',
    });

    authListener?.('SIGNED_OUT', null);
    await flushPromises();
    expect(listener).toHaveBeenLastCalledWith(null);

    stopObserving();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('returns a safe no-op observer when authentication is not configured', () => {
    const listener = jest.fn();
    const stopObserving = observeAuthSession(listener);

    expect(stopObserving()).toBeUndefined();
    expect(listener).not.toHaveBeenCalled();
  });
});
