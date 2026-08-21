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

  it('does not misreport a request timeout as an offline device', () => {
    const error = mapApiError({ status: 'TIMEOUT_ERROR', error: 'Timed out' });
    expect(error.code).toBe('PROVIDER_TIMEOUT');
    expect(error.message).toContain('longer');
    expect(error.message).not.toContain('connection');
  });

  it.each([
    ['USAGE_LIMIT_EXCEEDED', false],
    ['USAGE_METERING_UNAVAILABLE', true],
    ['RATE_LIMITED', true],
  ] as const)('maps %s with the intended retry behavior', (code, retryable) => {
    const error = mapApiError({ data: { error: { code } } });
    expect(error.code).toBe(code);
    expect(error.retryable).toBe(retryable);
    expect(error.message).not.toContain('provider');
  });
});
