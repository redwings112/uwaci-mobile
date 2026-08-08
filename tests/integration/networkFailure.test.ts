import { mapApiError } from '@/core/errors/mapApiError';

describe('network failure handling', () => {
  it('produces retry guidance for an offline request', () => {
    const error = mapApiError({ code: 'NETWORK_ERROR' });
    expect(error.retryable).toBe(true);
    expect(error.message).toContain('connection');
  });
});
