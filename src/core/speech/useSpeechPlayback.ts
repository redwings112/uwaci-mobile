import { useSyncExternalStore } from 'react';

import { speechService } from './speechService';

export function useSpeechPlayback() {
  return useSyncExternalStore(
    speechService.subscribe,
    speechService.getSnapshot,
    speechService.getSnapshot,
  );
}
