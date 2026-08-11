import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

import type { SpeakOptions } from './speechTypes';

export type SpeechPlaybackStatus = 'idle' | 'speaking' | 'paused';

export interface SpeechPlaybackSnapshot {
  status: SpeechPlaybackStatus;
  messageId: string | null;
}

let snapshot: SpeechPlaybackSnapshot = { status: 'idle', messageId: null };
const listeners = new Set<() => void>();

function updatePlayback(status: SpeechPlaybackStatus, messageId: string | null = null): void {
  snapshot = { status, messageId };
  listeners.forEach((listener) => listener());
}

export function resolveSpeechLanguage(
  requestedLanguage: string,
  availableVoices: readonly { language: string }[],
): string | null {
  const requested = requestedLanguage.toLowerCase();
  const exact = availableVoices.find((voice) => voice.language.toLowerCase() === requested);
  if (exact) return exact.language;
  const base = requested.split('-', 1)[0];
  return (
    availableVoices.find((voice) => voice.language.toLowerCase().split('-', 1)[0] === base)
      ?.language ?? null
  );
}

export const speechService = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): SpeechPlaybackSnapshot {
    return snapshot;
  },
  async speak(text: string, options: SpeakOptions = {}, messageId?: string): Promise<void> {
    await Speech.stop();
    let language = options.language;
    if (language) {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        const availableLanguage = resolveSpeechLanguage(language, voices);
        if (!availableLanguage) {
          // Some Android devices expose no matching locale even though their
          // default TTS engine can still speak the response. Fall back to the
          // device voice instead of silently producing no audio.
          language = undefined;
        } else {
          language = availableLanguage;
        }
      } catch {
        // If voice enumeration fails, let the native speech engine attempt the requested locale.
      }
    }
    updatePlayback('speaking', messageId ?? null);
    Speech.speak(text, {
      ...(language ? { language } : {}),
      ...(options.rate !== undefined ? { rate: options.rate } : {}),
      ...(options.pitch !== undefined ? { pitch: options.pitch } : {}),
      onDone: () => {
        updatePlayback('idle');
        options.onDone?.();
      },
      onStopped: () => {
        updatePlayback('idle');
        options.onStopped?.();
      },
      onError: () => {
        updatePlayback('idle');
        options.onError?.();
        options.onUnavailable?.();
      },
    });
  },
  async pause(): Promise<void> {
    if (snapshot.status !== 'speaking') return;
    if (Platform.OS === 'android') {
      updatePlayback('idle');
      await Speech.stop();
      return;
    }
    await Speech.pause();
    updatePlayback('paused', snapshot.messageId);
  },
  async resume(): Promise<void> {
    if (snapshot.status !== 'paused') return;
    if (Platform.OS === 'android') return;
    await Speech.resume();
    updatePlayback('speaking', snapshot.messageId);
  },
  async stop(): Promise<void> {
    updatePlayback('idle');
    await Speech.stop();
  },
  async isSpeaking(): Promise<boolean> {
    return snapshot.status !== 'idle' || Speech.isSpeakingAsync();
  },
};
