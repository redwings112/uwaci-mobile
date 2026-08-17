import { useEffect, useRef } from 'react';

const SPEECH_LEVEL = 0.3;
const SILENCE_LEVEL = 0.22;
const MIN_SPEECH_MILLIS = 500;
const SILENCE_TO_SUBMIT_MILLIS = 1_100;

interface SilenceAutoSubmitOptions {
  recording: boolean;
  audioLevel: number;
  durationMillis: number;
  onSilence: () => void;
}

export function useSilenceAutoSubmit({
  recording,
  audioLevel,
  durationMillis,
  onSilence,
}: SilenceAutoSubmitOptions): void {
  const callback = useRef(onSilence);
  const heardSpeech = useRef(false);
  const lastSpeechAt = useRef<number | null>(null);
  const submitted = useRef(false);

  useEffect(() => {
    callback.current = onSilence;
  }, [onSilence]);

  useEffect(() => {
    if (!recording) {
      heardSpeech.current = false;
      lastSpeechAt.current = null;
      submitted.current = false;
      return;
    }

    const now = Date.now();
    if (audioLevel >= SPEECH_LEVEL) {
      heardSpeech.current = true;
      lastSpeechAt.current = now;
      return;
    }

    if (
      audioLevel <= SILENCE_LEVEL &&
      heardSpeech.current &&
      !submitted.current &&
      durationMillis >= MIN_SPEECH_MILLIS &&
      lastSpeechAt.current !== null &&
      now - lastSpeechAt.current >= SILENCE_TO_SUBMIT_MILLIS
    ) {
      submitted.current = true;
      callback.current();
    }
  }, [audioLevel, durationMillis, recording]);
}
