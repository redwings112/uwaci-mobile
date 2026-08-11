import * as Speech from 'expo-speech';

import type { SpeakOptions } from './speechTypes';

let speaking = false;

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
  async speak(text: string, options: SpeakOptions = {}): Promise<void> {
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
    speaking = true;
    Speech.speak(text, {
      ...(language ? { language } : {}),
      ...(options.rate !== undefined ? { rate: options.rate } : {}),
      ...(options.pitch !== undefined ? { pitch: options.pitch } : {}),
      onDone: () => {
        speaking = false;
        options.onDone?.();
      },
      onStopped: () => {
        speaking = false;
        options.onStopped?.();
      },
      onError: () => {
        speaking = false;
        options.onError?.();
        options.onUnavailable?.();
      },
    });
  },
  async stop(): Promise<void> {
    speaking = false;
    await Speech.stop();
  },
  async isSpeaking(): Promise<boolean> {
    return speaking || Speech.isSpeakingAsync();
  },
};
