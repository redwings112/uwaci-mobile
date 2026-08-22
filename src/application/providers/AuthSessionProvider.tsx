import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { getAuthClient } from '@/core/auth/authClient';
import { initializeAuthSession, observeAuthSession } from '@/core/auth/authSession';
import { mapApiError } from '@/core/errors/mapApiError';
import { sessionFailed, sessionResolved } from '@/features/authentication/state/authSlice';
import { useAppDispatch } from '@/store/hooks';

export function AuthSessionProvider({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let active = true;
    const client = getAuthClient();
    const syncTokenRefresh = (state: string) => {
      if (!client) return;
      if (state === 'active') client.auth.startAutoRefresh();
      else client.auth.stopAutoRefresh();
    };
    syncTokenRefresh(AppState.currentState);
    const appStateSubscription = AppState.addEventListener('change', syncTokenRefresh);
    const stopObserving = observeAuthSession((session) => {
      if (active) dispatch(sessionResolved({ userId: session?.userId ?? null }));
    });
    void initializeAuthSession()
      .then((session) => {
        if (active) dispatch(sessionResolved({ userId: session?.userId ?? null }));
      })
      .catch((error: unknown) => {
        if (active) dispatch(sessionFailed(mapApiError(error).message));
      });
    return () => {
      active = false;
      appStateSubscription.remove();
      client?.auth.stopAutoRefresh();
      stopObserving();
    };
  }, [dispatch]);

  return children;
}
