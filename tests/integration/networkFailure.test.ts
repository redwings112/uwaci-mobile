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

  it('does not blame connectivity when a native audio upload fails while connected', () => {
    const error = mapApiError({
      status: 'CUSTOM_ERROR',
      error: 'Native request failed',
      data: {
        error: {
          code: 'AUDIO_UPLOAD_FAILED',
          details: { nativeError: 'UnableToUpload', platform: 'android' },
        },
      },
    });

    expect(error.code).toBe('AUDIO_UPLOAD_FAILED');
    expect(error.message).toContain('could not be uploaded');
    expect(error.message).not.toContain('Check your connection');
  });
});
