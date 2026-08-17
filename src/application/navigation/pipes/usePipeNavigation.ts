import { useCallback } from 'react';
import { type Href, useRouter } from 'expo-router';

import { getPipeConfig } from './pipe.config';
import type { CrossPipeNavigationTarget, PipeId } from './pipe.types';

export function usePipeNavigation() {
  const router = useRouter();

  const switchPipe = useCallback(
    (pipe: PipeId) => {
      router.replace(getPipeConfig(pipe).defaultRoute);
    },
    [router],
  );

  const navigateToPipe = useCallback(
    (target: CrossPipeNavigationTarget) => {
      // Only each Pipe's root is public today. This typed contract can grow with
      // route-specific parameter maps without leaking arbitrary strings.
      router.push(getPipeConfig(target.pipe).defaultRoute);
    },
    [router],
  );

  const openMenu = useCallback(
    (fromPipe: PipeId) => {
      router.push({ pathname: '/(app)/menu', params: { fromPipe } } as unknown as Href);
    },
    [router],
  );

  const openAccount = useCallback(
    (fromPipe: PipeId) => {
      router.push({ pathname: '/(app)/profile', params: { fromPipe } } as unknown as Href);
    },
    [router],
  );

  const navigate = useCallback((href: Href) => router.push(href), [router]);

  return { switchPipe, navigateToPipe, openMenu, openAccount, navigate };
}
