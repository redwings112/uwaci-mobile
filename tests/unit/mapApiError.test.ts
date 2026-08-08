import { mapApiError } from '@/core/errors/mapApiError';

describe('mapApiError', () => {
  it('maps backend codes without exposing provider messages', () => {
    const error = mapApiError({
      data: {
        success: false,
        error: { code: 'PROVIDER_TIMEOUT', message: 'Gemini internal detail' },
        meta: { request_id: 'req-1' },
      },
    });
    expect(error.code).toBe('PROVIDER_TIMEOUT');
    expect(error.retryable).toBe(true);
    expect(error.requestId).toBe('req-1');
    expect(error.message).not.toContain('Gemini');
  });

  it('safely handles unknown values', () => {
    expect(mapApiError('network exploded').code).toBe('UNKNOWN_ERROR');
  });
});
