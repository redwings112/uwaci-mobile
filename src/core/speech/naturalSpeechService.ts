import { createAudioPlayer, setAudioModeAsync, setIsAudioActiveAsync } from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import { appConfig } from '@/application/config/appConfig';
import { baseApi } from '@/core/api/baseApi';
import { getAccessToken } from '@/core/auth/authSession';
import { mapApiError } from '@/core/errors/mapApiError';
import { logger } from '@/core/logging/logger';
import { store } from '@/store';

interface CapabilitiesEnvelope {
  data?: { natural_tts?: boolean };
}

export type NaturalPlaybackResult =
  | 'done'
  | 'stopped'
  | 'unavailable'
  | 'error'
  | 'usage_limit_exceeded'
  | 'rate_limited'
  | 'metering_unavailable';

export interface PreparedNaturalSpeech {
  play(onStarted?: () => void): Promise<NaturalPlaybackResult>;
  discard(): void;
}

type NaturalSpeechPreparation = PreparedNaturalSpeech | NaturalPlaybackResult;

interface CapabilityRequest {
  accessToken: string | null;
  promise: Promise<boolean>;
}

let capabilityRequest: CapabilityRequest | null = null;
let activeStop: (() => void) | null = null;
const pendingGenerationControllers = new Set<AbortController>();
const PLAYBACK_START_TIMEOUT_MS = 5_000;

async function authorizationHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function naturalVoiceAvailable(): Promise<boolean> {
  // Home prewarms this before the user has necessarily restored a session. Do
  // not let that unauthenticated 401 suppress natural speech after sign-in.
  const accessToken = await getAccessToken();
  if (capabilityRequest?.accessToken === accessToken) return capabilityRequest.promise;
  const request = (async () => {
    try {
      const response = await fetch(`${appConfig.apiBaseUrl}/api/v1/voice/capabilities`, {
        headers: {
          Accept: 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });
      if (!response.ok) return false;
      const payload = (await response.json()) as CapabilitiesEnvelope;
      return payload.data?.natural_tts === true;
    } catch {
      return false;
    }
  })();
  capabilityRequest = { accessToken, promise: request };
  const available = await request;
  if (!available && capabilityRequest?.promise === request) capabilityRequest = null;
  return available;
}

function languageCode(locale?: string): string {
  return locale?.split('-', 1)[0]?.toLowerCase() || 'en';
}

function idempotencyKey(): string {
  return `tts-${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
}

function audioFileExtension(contentType: string | null): string {
  const mimeType = contentType?.split(';', 1)[0]?.trim().toLowerCase();
  if (mimeType === 'audio/wav' || mimeType === 'audio/x-wav') return 'wav';
  if (mimeType === 'audio/mp4' || mimeType === 'audio/m4a' || mimeType === 'audio/x-m4a')
    return 'm4a';
  if (mimeType === 'audio/ogg') return 'ogg';
  return 'mp3';
}

async function playbackError(response: Response): Promise<NaturalPlaybackResult> {
  try {
    const mapped = mapApiError(await response.json());
    if (mapped.code === 'USAGE_LIMIT_EXCEEDED') return 'usage_limit_exceeded';
    if (mapped.code === 'RATE_LIMITED') return 'rate_limited';
    if (mapped.code === 'USAGE_METERING_UNAVAILABLE') return 'metering_unavailable';
  } catch {
    // A non-JSON proxy error is handled by status below.
  }
  return response.status === 503 ? 'unavailable' : 'error';
}

async function createPreparedSpeech(
  text: string,
  language?: string,
): Promise<NaturalSpeechPreparation> {
  if (!(await naturalVoiceAvailable())) return 'unavailable';
  const controller = new AbortController();
  pendingGenerationControllers.add(controller);
  try {
    const response = await fetch(`${appConfig.apiBaseUrl}/api/v1/voice/speech`, {
      method: 'POST',
      headers: {
        Accept: 'audio/*',
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey(),
        ...(await authorizationHeaders()),
      },
      body: JSON.stringify({ text, language: languageCode(language) }),
      signal: controller.signal,
    });
    if (!response.ok) {
      if (response.status === 429 || response.status >= 500) capabilityRequest = null;
      logger.warn('Natural speech request failed', {
        status: response.status,
        language: languageCode(language),
      });
      return playbackError(response);
    }
    const correlationId = response.headers?.get?.('X-Uwaci-Correlation-ID') ?? undefined;
    const extension = audioFileExtension(response.headers?.get?.('content-type') ?? null);
    store.dispatch(baseApi.util.invalidateTags(['Usage']));

    let uri: string;
    let cleanupUnderlyingFile: () => void;
    if (Platform.OS === 'web') {
      const objectUrl = URL.createObjectURL(await response.blob());
      uri = objectUrl;
      cleanupUnderlyingFile = () => URL.revokeObjectURL(objectUrl);
    } else {
      const audioBytes = new Uint8Array(await response.arrayBuffer());
      if (audioBytes.byteLength === 0) {
        logger.error('Natural speech response contained no audio', {
          correlationId,
          language: languageCode(language),
        });
        return 'error';
      }
      const file = new File(Paths.cache, `uwaci-speech-${Date.now()}.${extension}`);
      file.create({ overwrite: true, intermediates: true });
      file.write(audioBytes);
      uri = file.uri;
      cleanupUnderlyingFile = () => {
        try {
          if (file.exists) file.delete();
        } catch {
          // Cache cleanup is best-effort.
        }
      };
    }

    let discarded = false;
    let cleaned = false;
    let stopPlayback: (() => void) | null = null;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      cleanupUnderlyingFile();
    };

    return {
      play: async (onStarted?: () => void) => {
        if (discarded) return Promise.resolve('stopped');
        try {
          return await new Promise<NaturalPlaybackResult>((resolve) => {
            let player: ReturnType<typeof createAudioPlayer> | null = null;
            let settled = false;
            let playRequested = false;
            let playbackStarted = false;
            let startupTimer: ReturnType<typeof setTimeout> | undefined;
            let subscription: { remove(): void } = { remove: () => undefined };
            const finish = (result: NaturalPlaybackResult) => {
              if (settled) return;
              settled = true;
              if (startupTimer) clearTimeout(startupTimer);
              subscription.remove();
              player?.pause();
              player?.remove();
              cleanup();
              stopPlayback = null;
              if (activeStop === stop) activeStop = null;
              resolve(result);
            };
            const stop = () => finish('stopped');
            const startPlayback = () => {
              if (playRequested || settled) return;
              if (!player) return;
              playRequested = true;
              player.volume = 1;
              player.muted = false;
              try {
                player.play();
              } catch (error: unknown) {
                logger.error('Natural speech play request failed', {
                  correlationId,
                  error: error instanceof Error ? error.name : 'unknown',
                  language: languageCode(language),
                });
                finish('error');
              }
            };
            const configureAndCreatePlayer = async () => {
              await setIsAudioActiveAsync(true);
              await setAudioModeAsync({
                allowsRecording: false,
                playsInSilentMode: true,
                interruptionMode: 'doNotMix',
                shouldRouteThroughEarpiece: false,
              });
              if (settled) return;
              player = createAudioPlayer(uri, { updateInterval: 80, downloadFirst: true });
              subscription = player.addListener('playbackStatusUpdate', (status) => {
                if (status.didJustFinish) {
                  if (playbackStarted) finish('done');
                  else {
                    logger.error('Natural speech finished without starting playback', {
                      correlationId,
                      language: languageCode(language),
                    });
                    finish('error');
                  }
                } else if (status.error) {
                  logger.error('Natural speech player reported an error', {
                    correlationId,
                    error: status.error,
                    language: languageCode(language),
                  });
                  finish('error');
                } else {
                  if (status.isLoaded) startPlayback();
                  if (status.playing) {
                    if (!playbackStarted) {
                      playbackStarted = true;
                      onStarted?.();
                    }
                    if (startupTimer) {
                      clearTimeout(startupTimer);
                      startupTimer = undefined;
                    }
                  }
                }
              });
              if (player.currentStatus.isLoaded) startPlayback();
            };
            stopPlayback = stop;
            activeStop = stop;
            startupTimer = setTimeout(() => {
              logger.error('Natural speech playback did not start', {
                correlationId,
                language: languageCode(language),
                timeoutMs: PLAYBACK_START_TIMEOUT_MS,
              });
              finish('error');
            }, PLAYBACK_START_TIMEOUT_MS);
            void configureAndCreatePlayer().catch((error: unknown) => {
              logger.error('Natural speech audio session could not be configured', {
                correlationId,
                error: error instanceof Error ? error.name : 'unknown',
                language: languageCode(language),
              });
              finish('error');
            });
          });
        } catch (error: unknown) {
          logger.error('Natural speech player could not be created', {
            correlationId,
            error: error instanceof Error ? error.name : 'unknown',
            language: languageCode(language),
          });
          cleanup();
          return 'error';
        }
      },
      discard: () => {
        if (discarded) return;
        discarded = true;
        stopPlayback?.();
        cleanup();
      },
    };
  } catch (error: unknown) {
    if (!controller.signal.aborted)
      logger.warn('Natural speech generation failed', {
        error: error instanceof Error ? error.name : 'unknown',
        language: languageCode(language),
      });
    return controller.signal.aborted ? 'stopped' : 'error';
  } finally {
    pendingGenerationControllers.delete(controller);
  }
}

export const naturalSpeechService = {
  prewarm(): void {
    void naturalVoiceAvailable();
  },

  isAvailable(): Promise<boolean> {
    return naturalVoiceAvailable();
  },

  prepare(text: string, language?: string): Promise<NaturalSpeechPreparation> {
    return createPreparedSpeech(text, language);
  },

  async play(text: string, language?: string): Promise<NaturalPlaybackResult> {
    activeStop?.();
    const prepared = await createPreparedSpeech(text, language);
    return typeof prepared === 'object' ? prepared.play() : prepared;
  },

  stop(): void {
    activeStop?.();
    activeStop = null;
    pendingGenerationControllers.forEach((controller) => controller.abort());
    pendingGenerationControllers.clear();
  },

  resetCapabilityCache(): void {
    capabilityRequest = null;
  },
};
