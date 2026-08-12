import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

import { prepareTextForSpeech } from './speechText';
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

export function resolveSpeechVoice<
  TVoice extends { language: string; identifier: string; quality?: string },
>(requestedLanguage: string, availableVoices: readonly TVoice[]): TVoice | null {
  const requested = requestedLanguage.toLowerCase();
  const base = requested.split('-', 1)[0];
  const compatible = availableVoices.filter((voice) => {
    const language = voice.language.toLowerCase();
    return language === requested || language.split('-', 1)[0] === base;
  });
  return (
    compatible.find(
      (voice) =>
        voice.language.toLowerCase() === requested && voice.quality?.toLowerCase() === 'enhanced',
    ) ??
    compatible.find((voice) => voice.quality?.toLowerCase() === 'enhanced') ??
    compatible.find((voice) => voice.language.toLowerCase() === requested) ??
    compatible[0] ??
    null
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
    const spokenText = prepareTextForSpeech(text, options.language);
    if (!spokenText) {
      updatePlayback('idle');
      options.onDone?.();
      return;
    }
    let language = options.language;
    let voice: string | undefined;
    if (language) {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        const availableVoice = resolveSpeechVoice(language, voices);
        if (!availableVoice) {
          // Some Android devices expose no matching locale even though their
          // default TTS engine can still speak the response. Fall back to the
          // device voice instead of silently producing no audio.
          language = undefined;
        } else {
          language = availableVoice.language;
          voice = availableVoice.identifier;
        }
      } catch {
        // If voice enumeration fails, let the native speech engine attempt the requested locale.
      }
    }
    updatePlayback('speaking', messageId ?? null);
    Speech.speak(spokenText, {
      ...(language ? { language } : {}),
      ...(voice ? { voice } : {}),
      rate: options.rate ?? 0.94,
      pitch: options.pitch ?? 1,
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
