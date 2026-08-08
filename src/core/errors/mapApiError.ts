import { AppError } from './AppError';
import type { ErrorCode } from './ErrorCode';

const userMessages: Partial<Record<ErrorCode, string>> = {
  INVALID_AUDIO: 'That recording could not be used. Please record again.',
  AUDIO_TOO_LARGE: 'That recording is too large. Please ask a shorter question.',
  AUDIO_TOO_LONG: 'That recording is too long. Please ask a shorter question.',
  UNSUPPORTED_LANGUAGE: 'That language is not supported yet.',
  TRANSCRIPTION_FAILED: 'We could not understand the recording. Please try again.',
  TRANSCRIPTION_LOW_CONFIDENCE: 'Please try saying that again.',
  PROVIDER_TIMEOUT: 'Uwaci is taking longer than expected. Please retry.',
  RATE_LIMITED: 'Too many requests were sent. Please wait a moment and retry.',
  AUTHENTICATION_REQUIRED: 'Please sign in again to continue.',
  NETWORK_ERROR: 'Check your connection and try again.',
};

const knownCodes = new Set<ErrorCode>([
  'INVALID_AUDIO',
  'AUDIO_TOO_LARGE',
  'AUDIO_TOO_LONG',
  'UNSUPPORTED_LANGUAGE',
  'TRANSCRIPTION_FAILED',
  'TRANSCRIPTION_LOW_CONFIDENCE',
  'LLM_PROVIDER_ERROR',
  'PROVIDER_TIMEOUT',
  'STORAGE_ERROR',
  'RATE_LIMITED',
  'AUTHENTICATION_REQUIRED',
  'FORBIDDEN',
  'RESOURCE_NOT_FOUND',
  'VALIDATION_ERROR',
  'NETWORK_ERROR',
  'PERMISSION_DENIED',
  'INTERNAL_ERROR',
  'UNKNOWN_ERROR',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function mapApiError(value: unknown): AppError {
  if (value instanceof AppError) return value;
  if (!isRecord(value))
    return new AppError('UNKNOWN_ERROR', 'Something went wrong. Please try again.');

  const envelope = isRecord(value.data) ? value.data : value;
  const backendError = isRecord(envelope.error) ? envelope.error : envelope;
  const rawCode = typeof backendError.code === 'string' ? backendError.code : 'UNKNOWN_ERROR';
  const code: ErrorCode = knownCodes.has(rawCode as ErrorCode)
    ? (rawCode as ErrorCode)
    : 'UNKNOWN_ERROR';
  const retryable =
    code === 'PROVIDER_TIMEOUT' || code === 'NETWORK_ERROR' || code === 'RATE_LIMITED';
  const requestId =
    isRecord(envelope.meta) && typeof envelope.meta.request_id === 'string'
      ? envelope.meta.request_id
      : undefined;

  return new AppError(
    code,
    userMessages[code] ?? 'Uwaci could not complete that request.',
    retryable,
    requestId,
  );
}
