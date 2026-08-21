import { naturalSpeechService } from '@/core/speech/naturalSpeechService';
import { getAccessToken } from '@/core/auth/authSession';

jest.mock('@/core/auth/authSession', () => ({ getAccessToken: jest.fn() }));

const mockGetAccessToken = jest.mocked(getAccessToken);

describe('natural speech usage control', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    naturalSpeechService.resetCapabilityCache();
  });

  beforeEach(() => {
    mockGetAccessToken.mockResolvedValue('access-token');
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
    globalThis.fetch = fetchMock as typeof fetch;

    await expect(naturalSpeechService.play('A safe answer', 'en-US')).resolves.toBe(
      'usage_limit_exceeded',
    );

    const request = fetchMock.mock.calls[1]?.[1] as RequestInit;
    const headers = request.headers as Record<string, string>;
    expect(headers['Idempotency-Key']).toMatch(/^tts-\d+-[a-z0-9]+$/);
    expect(request.body).toBe(JSON.stringify({ text: 'A safe answer', language: 'en' }));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retries capability discovery after an unauthenticated startup request', async () => {
    mockGetAccessToken.mockResolvedValue('access-token');
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 401 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { natural_tts: true } }),
      });
    globalThis.fetch = fetchMock as typeof fetch;

    await expect(naturalSpeechService.isAvailable()).resolves.toBe(false);
    await expect(naturalSpeechService.isAvailable()).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not reuse an unauthenticated prewarm after a session becomes available', async () => {
    let resolveUnauthenticated: ((response: { ok: false; status: number }) => void) | undefined;
    const fetchMock = jest
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<{ ok: false; status: number }>((resolve) => {
            resolveUnauthenticated = resolve;
          }),
      )
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { natural_tts: true } }),
      });
    globalThis.fetch = fetchMock as typeof fetch;
    mockGetAccessToken.mockResolvedValueOnce(null).mockResolvedValueOnce('access-token');

    const prewarm = naturalSpeechService.isAvailable();
    await Promise.resolve();
    const authenticated = naturalSpeechService.isAvailable();

    await expect(authenticated).resolves.toBe(true);
    resolveUnauthenticated?.({ ok: false, status: 401 });
    await expect(prewarm).resolves.toBe(false);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[1]).toEqual(
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer access-token' }),
      }),
    );
  });
});
