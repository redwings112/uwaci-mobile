import { createAudioPlayer } from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import { appConfig } from '@/application/config/appConfig';
import { getAccessToken } from '@/core/auth/authSession';

interface CapabilitiesEnvelope {
  data?: { natural_tts?: boolean };
}

type NaturalPlaybackResult = 'done' | 'stopped' | 'unavailable' | 'error';

let capabilityPromise: Promise<boolean> | null = null;
let activeStop: (() => void) | null = null;

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

export const naturalSpeechService = {
  prewarm(): void {
    void naturalVoiceAvailable();
  },

  isAvailable(): Promise<boolean> {
    return naturalVoiceAvailable();
  },

  async play(text: string, language?: string): Promise<NaturalPlaybackResult> {
    if (!(await naturalVoiceAvailable())) return 'unavailable';
    activeStop?.();
    try {
      const response = await fetch(`${appConfig.apiBaseUrl}/api/v1/voice/speech`, {
        method: 'POST',
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          ...(await authorizationHeaders()),
        },
        body: JSON.stringify({ text, language: languageCode(language) }),
      });
      if (!response.ok) {
        if (response.status === 429 || response.status >= 500) capabilityPromise = null;
        return response.status === 503 ? 'unavailable' : 'error';
      }

      let uri: string;
      let cleanupFile: () => void = () => undefined;
      if (Platform.OS === 'web') {
        const objectUrl = URL.createObjectURL(await response.blob());
        uri = objectUrl;
        cleanupFile = () => URL.revokeObjectURL(objectUrl);
      } else {
        const file = new File(Paths.cache, `uwaci-speech-${Date.now()}.mp3`);
        file.create({ overwrite: true, intermediates: true });
        file.write(new Uint8Array(await response.arrayBuffer()));
        uri = file.uri;
        cleanupFile = () => {
          try {
            if (file.exists) file.delete();
          } catch {
            // Cache cleanup is best-effort.
          }
        };
      }

      return await new Promise<NaturalPlaybackResult>((resolve) => {
        const player = createAudioPlayer(uri, { updateInterval: 80 });
        let settled = false;
        const finish = (result: NaturalPlaybackResult) => {
          if (settled) return;
          settled = true;
          subscription.remove();
          player.pause();
          player.release();
          cleanupFile();
          if (activeStop === stop) activeStop = null;
          resolve(result);
        };
        const stop = () => finish('stopped');
        const subscription = player.addListener('playbackStatusUpdate', (status) => {
          if (status.didJustFinish) finish('done');
          else if (status.error) finish('error');
        });
        activeStop = stop;
        player.play();
      });
    } catch {
      return 'error';
    }
  },

  stop(): void {
    activeStop?.();
    activeStop = null;
  },

  resetCapabilityCache(): void {
    capabilityPromise = null;
  },
};
