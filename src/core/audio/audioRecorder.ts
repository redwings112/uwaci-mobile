import { File } from 'expo-file-system';
import { setAudioModeAsync } from 'expo-audio';

import { MAX_RECORDING_SECONDS } from '@/core/constants/audio';
import { AppError } from '@/core/errors/AppError';

import type { CompletedRecording, ManagedAudioRecorder } from './audioTypes';

export async function startAudioRecording(recorder: ManagedAudioRecorder): Promise<void> {
  await setAudioModeAsync({
    allowsRecording: true,
    playsInSilentMode: true,
    interruptionMode: 'doNotMix',
  });
  await recorder.prepareToRecordAsync();
  recorder.record({ forDuration: MAX_RECORDING_SECONDS });
}

export async function stopAudioRecording(
  recorder: ManagedAudioRecorder,
  durationMillis: number,
): Promise<CompletedRecording> {
  await recorder.stop();
  await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
  if (!recorder.uri)
    throw new AppError('INVALID_AUDIO', 'No recording was created. Please try again.');
  return { uri: recorder.uri, durationMillis };
}

export function deleteTemporaryRecording(uri: string | null | undefined): void {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // Cleanup is best-effort and must never hide a successful answer.
  }
}

export async function cancelAudioRecording(recorder: ManagedAudioRecorder): Promise<void> {
  if (recorder.isRecording) await recorder.stop();
  deleteTemporaryRecording(recorder.uri);
  await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
}
