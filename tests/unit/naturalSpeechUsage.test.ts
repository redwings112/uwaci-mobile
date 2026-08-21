import { naturalSpeechService } from '@/core/speech/naturalSpeechService';

describe('natural speech usage control', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    naturalSpeechService.resetCapabilityCache();
  });

  it('sends one idempotency key and preserves the backend quota code', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { natural_tts: true } }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: { code: 'USAGE_LIMIT_EXCEEDED' } }),
      });
    global.fetch = fetchMock as typeof fetch;

    await expect(naturalSpeechService.play('A safe answer', 'en-US')).resolves.toBe(
      'usage_limit_exceeded',
    );

    const request = fetchMock.mock.calls[1]?.[1] as RequestInit;
    const headers = request.headers as Record<string, string>;
    expect(headers['Idempotency-Key']).toMatch(/^tts-\d+-[a-z0-9]+$/);
    expect(request.body).toBe(JSON.stringify({ text: 'A safe answer', language: 'en' }));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
