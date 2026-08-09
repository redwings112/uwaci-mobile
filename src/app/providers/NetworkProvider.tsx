import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { getNetworkState, subscribeToNetworkState } from '@/core/network/networkInfo';
import { networkStateChanged } from '@/core/network/networkSlice';
import { useAppDispatch } from '@/store/hooks';

export function NetworkProvider({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeToNetworkState((state) => {
      if (active) dispatch(networkStateChanged(state));
    });
    void getNetworkState()
      .then((state) => {
        if (active) dispatch(networkStateChanged(state));
      })
      .catch(() => {
        // Subscription updates remain authoritative if the initial fetch fails.
      });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [dispatch]);

  return children;
}
