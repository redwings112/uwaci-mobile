import { File } from 'expo-file-system';
import { i18n } from '@/localization';
import { setAudioModeAsync } from 'expo-audio';

import { MAX_RECORDING_SECONDS, MIN_RECORDING_MILLIS } from '@/core/constants/audio';
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
): Promise<CompletedRecording> {
  const status = recorder.getStatus();
  if (recorder.isRecording) await recorder.stop();
  await deactivateRecordingAudioMode();
  if (!recorder.uri) throw new AppError('INVALID_AUDIO', i18n.t('errors.RECORDING_MISSING'));
  if (status.durationMillis < MIN_RECORDING_MILLIS) {
    deleteTemporaryRecording(recorder.uri);
    throw new AppError('INVALID_AUDIO', i18n.t('errors.RECORDING_TOO_SHORT'));
  }
  return { uri: recorder.uri, durationMillis: status.durationMillis };
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
  let uri: string | null = null;
  try {
    uri = recorder.uri;
    if (recorder.isRecording) await recorder.stop();
  } catch (error: unknown) {
    if (!isReleasedAudioRecorderError(error)) throw error;
  }
  deleteTemporaryRecording(uri);
  await deactivateRecordingAudioMode();
}

export async function deactivateRecordingAudioMode(): Promise<void> {
  await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
}

export function isReleasedAudioRecorderError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /shared object.*already released|cannot use shared object/i.test(message);
}
