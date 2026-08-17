import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

import { prepareTextForSpeech } from './speechText';
import type { SpeakOptions } from './speechTypes';
import { naturalSpeechService } from './naturalSpeechService';

export type SpeechPlaybackStatus = 'idle' | 'speaking' | 'paused';

export interface SpeechPlaybackSnapshot {
  status: SpeechPlaybackStatus;
  messageId: string | null;
}

let snapshot: SpeechPlaybackSnapshot = { status: 'idle', messageId: null };
const listeners = new Set<() => void>();
let availableVoicesPromise: ReturnType<typeof Speech.getAvailableVoicesAsync> | null = null;
let activeStreamCancel: (() => void) | null = null;

export interface SpeechStreamSession {
  enqueue(text: string): void;
  finish(): void;
  cancel(): Promise<void>;
}

function availableVoices() {
  availableVoicesPromise ??= Speech.getAvailableVoicesAsync().catch((error) => {
    availableVoicesPromise = null;
    throw error;
  });
  return availableVoicesPromise;
}

function updatePlayback(status: SpeechPlaybackStatus, messageId: string | null = null): void {
  snapshot = { status, messageId };
  listeners.forEach((listener) => listener());
}

async function resolveNativeVoice(language?: string): Promise<{
  language?: string;
  voice?: string;
}> {
  if (!language) return {};
  try {
    const voices = await availableVoices();
    const availableVoice = resolveSpeechVoice(language, voices);
    if (!availableVoice) return {};
    return { language: availableVoice.language, voice: availableVoice.identifier };
  } catch {
    return { language };
  }
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
  prewarm(): void {
    void availableVoices().catch(() => undefined);
    naturalSpeechService.prewarm();
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): SpeechPlaybackSnapshot {
    return snapshot;
  },
  async speak(text: string, options: SpeakOptions = {}, messageId?: string): Promise<void> {
    activeStreamCancel?.();
    activeStreamCancel = null;
    await Speech.stop();
    naturalSpeechService.stop();
    const spokenText = prepareTextForSpeech(text, options.language);
    if (!spokenText) {
      updatePlayback('idle');
      options.onDone?.();
      return;
    }
    updatePlayback('speaking', messageId ?? null);
    const naturalResult = await naturalSpeechService.play(spokenText, options.language);
    if (naturalResult === 'done') {
      updatePlayback('idle');
      options.onDone?.();
      return;
    }
    if (naturalResult === 'stopped') {
      updatePlayback('idle');
      options.onStopped?.();
      return;
    }
    const { language, voice } = await resolveNativeVoice(options.language);
    Speech.speak(spokenText, {
      ...(language ? { language } : {}),
      ...(voice ? { voice } : {}),
      rate: options.rate ?? 0.96,
      pitch: options.pitch ?? 1.02,
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
  async createStream(options: SpeakOptions = {}, messageId?: string): Promise<SpeechStreamSession> {
    activeStreamCancel?.();
    await Speech.stop();
    const nativeVoice = await resolveNativeVoice(options.language);
    const naturalAvailable = await naturalSpeechService.isAvailable();
    let buffer = '';
    let queued = 0;
    let completed = 0;
    let finished = false;
    let cancelled = false;
    let failed = false;
    let playbackChain = Promise.resolve();

    const finishIfReady = () => {
      if (!cancelled && finished && completed >= queued) {
        activeStreamCancel = null;
        updatePlayback('idle');
        options.onDone?.();
      }
    };
    const speakNativeChunk = (text: string): Promise<'done' | 'stopped' | 'error'> =>
      new Promise((resolve) => {
        Speech.speak(text, {
          ...nativeVoice,
          rate: options.rate ?? 0.96,
          pitch: options.pitch ?? 1.02,
          onDone: () => resolve('done'),
          onStopped: () => resolve('stopped'),
          onError: () => resolve('error'),
        });
      });
    const queueChunk = (raw: string) => {
      const text = prepareTextForSpeech(raw, options.language);
      if (!text || cancelled) return;
      queued += 1;
      updatePlayback('speaking', messageId ?? null);
      if (!naturalAvailable) {
        Speech.speak(text, {
          ...nativeVoice,
          rate: options.rate ?? 0.96,
          pitch: options.pitch ?? 1.02,
          onDone: () => {
            completed += 1;
            finishIfReady();
          },
          onStopped: () => {
            if (!cancelled) options.onStopped?.();
          },
          onError: () => {
            if (failed || cancelled) return;
            failed = true;
            updatePlayback('idle');
            options.onError?.();
            options.onUnavailable?.();
          },
        });
        return;
      }
      playbackChain = playbackChain.then(async () => {
        if (cancelled || failed) return;
        let outcome = await naturalSpeechService.play(text, options.language);
        if (outcome === 'unavailable' || outcome === 'error')
          outcome = await speakNativeChunk(text);
        if (cancelled) return;
        if (outcome === 'error') {
          if (failed) return;
          failed = true;
          updatePlayback('idle');
          options.onError?.();
          options.onUnavailable?.();
          return;
        }
        if (outcome === 'stopped') {
          options.onStopped?.();
          return;
        }
        completed += 1;
        finishIfReady();
      });
    };
    const drainSentences = () => {
      const boundary = /[.!?。！？](?:["'”’)]*)\s+/g;
      let lastBoundary = 0;
      for (const match of buffer.matchAll(boundary)) {
        lastBoundary = (match.index ?? 0) + match[0].length;
      }
      if (lastBoundary > 0) {
        queueChunk(buffer.slice(0, lastBoundary));
        buffer = buffer.slice(lastBoundary);
      } else if (buffer.length > 220) {
        const splitAt = buffer.lastIndexOf(' ', 200);
        if (splitAt > 80) {
          queueChunk(buffer.slice(0, splitAt + 1));
          buffer = buffer.slice(splitAt + 1);
        }
      }
    };
    const cancel = async () => {
      if (cancelled) return;
      cancelled = true;
      buffer = '';
      activeStreamCancel = null;
      updatePlayback('idle');
      naturalSpeechService.stop();
      await Speech.stop();
    };
    activeStreamCancel = () => {
      cancelled = true;
      buffer = '';
      naturalSpeechService.stop();
    };
    return {
      enqueue(text: string) {
        if (cancelled || finished) return;
        buffer += text;
        drainSentences();
      },
      finish() {
        if (cancelled || finished) return;
        finished = true;
        if (buffer.trim()) queueChunk(buffer);
        buffer = '';
        finishIfReady();
      },
      cancel,
    };
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
    activeStreamCancel?.();
    activeStreamCancel = null;
    updatePlayback('idle');
    naturalSpeechService.stop();
    await Speech.stop();
  },
  async isSpeaking(): Promise<boolean> {
    return snapshot.status !== 'idle' || Speech.isSpeakingAsync();
  },
};
