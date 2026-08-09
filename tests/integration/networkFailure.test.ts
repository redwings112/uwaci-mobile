import { mapApiError } from '@/core/errors/mapApiError';

describe('network failure handling', () => {
  it('produces retry guidance for an offline request', () => {
    const error = mapApiError({ status: 'FETCH_ERROR', error: 'Network request failed' });
    expect(error.retryable).toBe(true);
    expect(error.message).toContain('connection');
  });

  it('preserves safe low-confidence recovery metadata', () => {
    const error = mapApiError({
      data: {
        error: {
          code: 'TRANSCRIPTION_LOW_CONFIDENCE',
          message: 'provider message',
          details: { transcript: 'Bonjour hello', confidence: 0.31 },
        },
      },
    });
    expect(error.details).toEqual({ transcript: 'Bonjour hello', confidence: 0.31 });
    expect(error.message).not.toContain('provider');
  });
});
