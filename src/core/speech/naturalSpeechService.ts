import { createAudioPlayer } from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import { appConfig } from '@/application/config/appConfig';
import { baseApi } from '@/core/api/baseApi';
import { getAccessToken } from '@/core/auth/authSession';
import { mapApiError } from '@/core/errors/mapApiError';
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
  play(): Promise<NaturalPlaybackResult>;
  discard(): void;
}

type NaturalSpeechPreparation = PreparedNaturalSpeech | NaturalPlaybackResult;

let capabilityPromise: Promise<boolean> | null = null;
let activeStop: (() => void) | null = null;
const pendingGenerationControllers = new Set<AbortController>();

async function authorizationHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function naturalVoiceAvailable(): Promise<boolean> {
  capabilityPromise ??= (async () => {
    try {
      const response = await fetch(`${appConfig.apiBaseUrl}/api/v1/voice/capabilities`, {
        headers: { Accept: 'application/json', ...(await authorizationHeaders()) },
      });
      if (!response.ok) return false;
      const payload = (await response.json()) as CapabilitiesEnvelope;
      return payload.data?.natural_tts === true;
    } catch {
      return false;
    }
  })();
  return capabilityPromise;
}

function languageCode(locale?: string): string {
  return locale?.split('-', 1)[0]?.toLowerCase() || 'en';
}

function idempotencyKey(): string {
  return `tts-${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
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
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey(),
        ...(await authorizationHeaders()),
      },
      body: JSON.stringify({ text, language: languageCode(language) }),
      signal: controller.signal,
    });
    if (!response.ok) {
      if (response.status === 429 || response.status >= 500) capabilityPromise = null;
      return playbackError(response);
    }
    store.dispatch(baseApi.util.invalidateTags(['Usage']));

    let uri: string;
    let cleanupUnderlyingFile: () => void;
    if (Platform.OS === 'web') {
      const objectUrl = URL.createObjectURL(await response.blob());
      uri = objectUrl;
      cleanupUnderlyingFile = () => URL.revokeObjectURL(objectUrl);
    } else {
      const file = new File(Paths.cache, `uwaci-speech-${Date.now()}.mp3`);
      file.create({ overwrite: true, intermediates: true });
      file.write(new Uint8Array(await response.arrayBuffer()));
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
      play: () => {
        if (discarded) return Promise.resolve('stopped');
        return new Promise<NaturalPlaybackResult>((resolve) => {
          const player = createAudioPlayer(uri, { updateInterval: 80 });
          let settled = false;
          const finish = (result: NaturalPlaybackResult) => {
            if (settled) return;
            settled = true;
            subscription.remove();
            player.pause();
            player.release();
            cleanup();
            stopPlayback = null;
            if (activeStop === stop) activeStop = null;
            resolve(result);
          };
          const stop = () => finish('stopped');
          const subscription = player.addListener('playbackStatusUpdate', (status) => {
            if (status.didJustFinish) finish('done');
            else if (status.error) finish('error');
          });
          stopPlayback = stop;
          activeStop = stop;
          player.play();
        });
      },
      discard: () => {
        if (discarded) return;
        discarded = true;
        stopPlayback?.();
        cleanup();
      },
    };
  } catch {
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
    capabilityPromise = null;
  },
};
