import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

import { mapApiError } from '@/core/errors/mapApiError';

import { prepareTextForSpeech } from './speechText';
import type { SpeakOptions } from './speechTypes';
import { naturalSpeechService, type PreparedNaturalSpeech } from './naturalSpeechService';

export type SpeechPlaybackStatus = 'idle' | 'speaking' | 'paused';

export interface SpeechPlaybackSnapshot {
  status: SpeechPlaybackStatus;
  messageId: string | null;
}

let snapshot: SpeechPlaybackSnapshot = { status: 'idle', messageId: null };
const listeners = new Set<() => void>();
let availableVoicesPromise: ReturnType<typeof Speech.getAvailableVoicesAsync> | null = null;
let activeStreamCancel: (() => void) | null = null;

type NaturalUsageFailure = 'usage_limit_exceeded' | 'rate_limited' | 'metering_unavailable';

function naturalFailureCode(result: NaturalUsageFailure) {
  if (result === 'usage_limit_exceeded') return 'USAGE_LIMIT_EXCEEDED' as const;
  if (result === 'rate_limited') return 'RATE_LIMITED' as const;
  return 'USAGE_METERING_UNAVAILABLE' as const;
}

function isNaturalUsageFailure(result: string): result is NaturalUsageFailure {
  return (
    result === 'usage_limit_exceeded' ||
    result === 'rate_limited' ||
    result === 'metering_unavailable'
  );
}

function reportNaturalUsageFailure(result: NaturalUsageFailure, options: SpeakOptions): void {
  options.onNaturalError?.(mapApiError({ error: { code: naturalFailureCode(result) } }));
}

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

interface NativeVoiceSelection {
  available: boolean;
  options: { language?: string; voice?: string };
}

async function resolveNativeVoice(language?: string): Promise<NativeVoiceSelection> {
  if (!language) return { available: true, options: {} };
  try {
    const voices = await availableVoices();
    const availableVoice = resolveSpeechVoice(language, voices);
    if (!availableVoice) return { available: false, options: {} };
    return {
      available: true,
      options: { language: availableVoice.language, voice: availableVoice.identifier },
    };
  } catch {
    // If voice enumeration itself fails, let the platform resolve the requested
    // locale. A confirmed missing locale is handled above and never falls back
    // silently to an English default voice.
    return { available: true, options: { language } };
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
    // A speaker tap has the same latency requirement as a live voice turn.
    // Route it through the sentence queue instead of making one TTS request for
    // the entire answer, which can hold playback until every paragraph is ready.
    const session = await this.createStream(options, messageId);
    session.enqueue(text);
    session.finish();
  },
  async createStream(options: SpeakOptions = {}, messageId?: string): Promise<SpeechStreamSession> {
    activeStreamCancel?.();
    naturalSpeechService.stop();
    await Speech.stop();
    // Do not block the answer stream on network capability discovery or native
    // voice enumeration. Deltas must be accepted as soon as uwaci ai emits them.
    const nativeVoicePromise = resolveNativeVoice(options.language);
    const naturalAvailablePromise = naturalSpeechService.isAvailable();
    let buffer = '';
    let queued = 0;
    let completed = 0;
    let finished = false;
    let cancelled = false;
    let failed = false;
    let playbackStarted = false;
    let useNativeForTurn = false;
    let naturalUsageFailureReported = false;
    let playbackChain = Promise.resolve();
    const preparedNaturalSpeech = new Set<PreparedNaturalSpeech>();
    let activePreparations = 0;
    const preparationWaiters: (() => void)[] = [];

    const acquirePreparationSlot = async () => {
      if (activePreparations < 2) {
        activePreparations += 1;
        return;
      }
      await new Promise<void>((resolve) => preparationWaiters.push(resolve));
      activePreparations += 1;
    };
    const releasePreparationSlot = () => {
      activePreparations -= 1;
      preparationWaiters.shift()?.();
    };
    const prepareNaturalChunk = async (text: string) => {
      await acquirePreparationSlot();
      try {
        if (cancelled) return 'stopped' as const;
        const naturalAvailable = useNativeForTurn ? false : await naturalAvailablePromise;
        if (!naturalAvailable) useNativeForTurn = true;
        return useNativeForTurn
          ? ('unavailable' as const)
          : await naturalSpeechService.prepare(text, options.language);
      } finally {
        releasePreparationSlot();
      }
    };

    const finishIfReady = () => {
      if (!cancelled && finished && completed >= queued) {
        activeStreamCancel = null;
        updatePlayback('idle');
        options.onDone?.();
      }
    };
    const markPlaybackStarted = () => {
      if (!playbackStarted) {
        playbackStarted = true;
        options.onStart?.();
      }
      updatePlayback('speaking', messageId ?? null);
    };
    const speakNativeChunk = async (text: string): Promise<'done' | 'stopped' | 'error'> => {
      const nativeVoice = await nativeVoicePromise;
      if (!nativeVoice.available) return 'error';
      markPlaybackStarted();
      return new Promise((resolve) => {
        Speech.speak(text, {
          ...nativeVoice.options,
          rate: options.rate ?? 0.96,
          pitch: options.pitch ?? 1.02,
          onDone: () => resolve('done'),
          onStopped: () => resolve('stopped'),
          onError: () => resolve('error'),
        });
      });
    };
    const queueChunk = (raw: string) => {
      const text = prepareTextForSpeech(raw, options.language);
      if (!text || cancelled) return;
      queued += 1;
      // Keep only the current and next sentence in synthesis. This maintains
      // continuous playback without issuing one provider request per sentence
      // for a long speaker-tapped answer all at once.
      const prepared = prepareNaturalChunk(text);
      void prepared.then((result) => {
        if (typeof result !== 'object') return;
        if (cancelled) result.discard();
        else preparedNaturalSpeech.add(result);
      });
      playbackChain = playbackChain.then(async () => {
        if (cancelled || failed) return;
        const naturalSpeech = useNativeForTurn ? 'unavailable' : await prepared;
        if (typeof naturalSpeech === 'object') preparedNaturalSpeech.delete(naturalSpeech);
        if (cancelled) {
          if (typeof naturalSpeech === 'object') naturalSpeech.discard();
          return;
        }
        let outcome =
          typeof naturalSpeech === 'object'
            ? await naturalSpeech.play(markPlaybackStarted)
            : naturalSpeech;
        if (isNaturalUsageFailure(outcome)) {
          if (!naturalUsageFailureReported) {
            naturalUsageFailureReported = true;
            reportNaturalUsageFailure(outcome, options);
          }
          outcome = 'error';
        }
        if (useNativeForTurn && (outcome === 'unavailable' || outcome === 'error'))
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
        if (outcome === 'stopped') options.onStopped?.();
        completed += 1;
        finishIfReady();
      });
    };
    const drainSentences = () => {
      // Release the *first* complete sentence immediately. The previous
      // last-boundary strategy merged every sentence already in the buffer into
      // one TTS request, so tapping play on a full answer waited for full-answer
      // synthesis before any audio could begin.
      while (true) {
        const boundary = /[.!?。！？](?:["'”’)]*)(?:\s+|$)/.exec(buffer);
        if (boundary) {
          const end = (boundary.index ?? 0) + boundary[0].length;
          queueChunk(buffer.slice(0, end));
          buffer = buffer.slice(end);
          continue;
        }
        const clauseMatches = [...buffer.matchAll(/[,;:]\s+/g)];
        const clauseBoundary = clauseMatches.at(-1);
        const clauseEnd = clauseBoundary
          ? (clauseBoundary.index ?? 0) + clauseBoundary[0].length
          : 0;
        if (clauseEnd >= 48) {
          queueChunk(buffer.slice(0, clauseEnd));
          buffer = buffer.slice(clauseEnd);
          continue;
        }
        if (buffer.length > 96) {
          const splitAt = buffer.lastIndexOf(' ', 84);
          if (splitAt > 48) {
            queueChunk(buffer.slice(0, splitAt + 1));
            buffer = buffer.slice(splitAt + 1);
            continue;
          }
        }
        return;
      }
    };
    const cancel = async () => {
      if (cancelled) return;
      cancelled = true;
      buffer = '';
      activeStreamCancel = null;
      updatePlayback('idle');
      preparedNaturalSpeech.forEach((speech) => speech.discard());
      preparedNaturalSpeech.clear();
      naturalSpeechService.stop();
      await Speech.stop();
    };
    activeStreamCancel = () => {
      void cancel();
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
