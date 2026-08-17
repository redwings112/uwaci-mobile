import { i18n } from '@/localization';

import { AppError } from './AppError';
import type { ErrorCode } from './ErrorCode';

function userMessage(code: ErrorCode): string | undefined {
  const key = `errors.${code}`;
  const translated = i18n.t(key);
  return translated === key ? undefined : translated;
}

const knownCodes = new Set<ErrorCode>([
  'INVALID_AUDIO',
  'AUDIO_TOO_LARGE',
  'AUDIO_TOO_LONG',
  'AUDIO_UPLOAD_FAILED',
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

  if (value.status === 'TIMEOUT_ERROR') {
    return new AppError(
      'PROVIDER_TIMEOUT',
      userMessage('PROVIDER_TIMEOUT') ?? 'Uwaci is taking longer than expected. Please retry.',
      true,
      undefined,
      {
        transportStatus: 'TIMEOUT_ERROR',
      },
    );
  }

  if (value.status === 'FETCH_ERROR') {
    const transportError = typeof value.error === 'string' ? value.error : 'Request failed';
    return new AppError(
      'NETWORK_ERROR',
      userMessage('NETWORK_ERROR') ?? 'Check your connection and try again.',
      true,
      undefined,
      {
        transportStatus: 'FETCH_ERROR',
        transportError,
      },
    );
  }

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
  const details = isRecord(backendError.details) ? backendError.details : undefined;

  return new AppError(
    code,
    userMessage(code) ?? 'Uwaci could not complete that request.',
    retryable,
    requestId,
    details,
  );
}
