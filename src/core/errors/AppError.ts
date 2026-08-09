import type { ErrorCode } from './ErrorCode';

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly retryable = false,
    public readonly requestId?: string,
    public readonly details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
