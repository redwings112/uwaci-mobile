import { naturalSpeechService } from '@/core/speech/naturalSpeechService';
import { getAccessToken } from '@/core/auth/authSession';
import { createAudioPlayer, setAudioModeAsync, setIsAudioActiveAsync } from 'expo-audio';

jest.mock('@/core/auth/authSession', () => ({ getAccessToken: jest.fn() }));
jest.mock('expo-file-system', () => ({
  Paths: { cache: 'file:///cache' },
  File: jest.fn().mockImplementation((_directory: string, name: string) => ({
    uri: `file:///cache/${name}`,
    exists: true,
    create: jest.fn(),
    write: jest.fn(),
    delete: jest.fn(),
  })),
}));

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

  it('waits for the ElevenLabs MP3 to load before starting native playback', async () => {
    let playbackListener: ((status: Record<string, unknown>) => void) | undefined;
    const player = {
      currentStatus: { isLoaded: false },
      play: jest.fn(),
      pause: jest.fn(),
      remove: jest.fn(),
      addListener: jest.fn(
        (_event: string, listener: (status: Record<string, unknown>) => void) => {
          playbackListener = listener;
          return { remove: jest.fn() };
        },
      ),
    };
    jest.mocked(createAudioPlayer).mockReturnValueOnce(player as never);
    globalThis.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { natural_tts: true } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
      }) as typeof fetch;

    const prepared = await naturalSpeechService.prepare('ElevenLabs voice', 'en-US');
    expect(typeof prepared).toBe('object');
    if (typeof prepared !== 'object') throw new Error('Expected prepared ElevenLabs speech.');
    const onStarted = jest.fn();
    const playback = prepared.play(onStarted);
    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    expect(player.play).not.toHaveBeenCalled();
    playbackListener?.({ isLoaded: true, playing: false, didJustFinish: false });
    expect(player.play).toHaveBeenCalledTimes(1);
    expect(setIsAudioActiveAsync).toHaveBeenCalledWith(true);
    expect(setAudioModeAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        allowsRecording: false,
        playsInSilentMode: true,
        interruptionMode: 'doNotMix',
        shouldRouteThroughEarpiece: false,
      }),
    );
    expect(onStarted).not.toHaveBeenCalled();
    playbackListener?.({ isLoaded: true, playing: true, didJustFinish: false });
    expect(onStarted).toHaveBeenCalledTimes(1);
    playbackListener?.({ isLoaded: true, playing: false, didJustFinish: true });

    await expect(playback).resolves.toBe('done');
    expect(player.remove).toHaveBeenCalledTimes(1);
  });

  it('rejects a native completion event when playback never actually started', async () => {
    let playbackListener: ((status: Record<string, unknown>) => void) | undefined;
    const player = {
      currentStatus: { isLoaded: false },
      play: jest.fn(),
      pause: jest.fn(),
      remove: jest.fn(),
      addListener: jest.fn(
        (_event: string, listener: (status: Record<string, unknown>) => void) => {
          playbackListener = listener;
          return { remove: jest.fn() };
        },
      ),
    };
    jest.mocked(createAudioPlayer).mockReturnValueOnce(player as never);
    globalThis.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { natural_tts: true } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'correlation-id' },
        arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
      }) as typeof fetch;
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const prepared = await naturalSpeechService.prepare('ElevenLabs voice', 'en-US');
    if (typeof prepared !== 'object') throw new Error('Expected prepared ElevenLabs speech.');
    const playback = prepared.play();
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    playbackListener?.({ isLoaded: true, playing: false, didJustFinish: true });

    await expect(playback).resolves.toBe('error');
    expect(consoleError).toHaveBeenCalledWith(
      'Natural speech finished without starting playback',
      expect.objectContaining({ correlationId: 'correlation-id' }),
    );
    consoleError.mockRestore();
  });

  it('stores WAV output from Deepgram, Gemini, or Simba with a WAV extension', async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { natural_tts: true } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: (name: string) => (name === 'content-type' ? 'audio/wav' : null) },
        arrayBuffer: async () => new Uint8Array([82, 73, 70, 70]).buffer,
      }) as typeof fetch;

    const prepared = await naturalSpeechService.prepare('Primary human voice', 'fr-FR');

    expect(typeof prepared).toBe('object');
    const fileConstructor = jest.requireMock('expo-file-system').File as jest.Mock;
    expect(fileConstructor.mock.calls.at(-1)?.[1]).toMatch(/\.wav$/);
    if (typeof prepared === 'object') prepared.discard();
  });
});
