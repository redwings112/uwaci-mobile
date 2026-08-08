import * as Speech from 'expo-speech';

import type { SpeakOptions } from './speechTypes';

let speaking = false;

export const speechService = {
  async speak(text: string, options: SpeakOptions = {}): Promise<void> {
    await Speech.stop();
    speaking = true;
    Speech.speak(text, {
      ...(options.language ? { language: options.language } : {}),
      ...(options.rate !== undefined ? { rate: options.rate } : {}),
      ...(options.pitch !== undefined ? { pitch: options.pitch } : {}),
      onDone: () => {
        speaking = false;
        options.onDone?.();
      },
      onStopped: () => {
        speaking = false;
      },
      onError: () => {
        speaking = false;
        options.onError?.();
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
