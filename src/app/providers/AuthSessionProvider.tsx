import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { initializeAuthSession, observeAuthSession } from '@/core/auth/authSession';
import { mapApiError } from '@/core/errors/mapApiError';
import { sessionFailed, sessionResolved } from '@/features/authentication/state/authSlice';
import { useAppDispatch } from '@/store/hooks';

export function AuthSessionProvider({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let active = true;
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
      stopObserving();
    };
  }, [dispatch]);

  return children;
}
