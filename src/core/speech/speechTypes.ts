import type { AppError } from '@/core/errors/AppError';

export interface SpeakOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onDone?: () => void;
  onError?: () => void;
  onStopped?: () => void;
  onUnavailable?: () => void;
  onNaturalError?: (error: AppError) => void;
}
