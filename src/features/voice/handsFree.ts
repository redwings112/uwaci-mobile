import type { VoiceStatus } from './types';

export const HANDS_FREE_RESUME_DELAY_MS = 120;

export interface HandsFreeConditions {
  listening: boolean;
  status: VoiceStatus;
  focused: boolean;
  busy: boolean;
  speaking: boolean;
  hasError: boolean;
  turnInFlight: boolean;
}

export function shouldResumeListening({
  listening,
  status,
  focused,
  busy,
  speaking,
  hasError,
  turnInFlight,
}: HandsFreeConditions): boolean {
  if (!listening || !focused || hasError) return false;
  if (busy || speaking || turnInFlight) return false;
  return status === 'idle' || status === 'ready';
}
