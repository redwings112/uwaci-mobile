import { useCallback, useEffect } from 'react';
import { RecordingPresets, useAudioRecorder, useAudioRecorderState } from 'expo-audio';

import {
  cancelAudioRecording,
  startAudioRecording,
  stopAudioRecording,
} from '@/core/audio/audioRecorder';
import { requestMicrophonePermission } from '@/core/audio/audioPermissions';
import { AppError } from '@/core/errors/AppError';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { recordingUpdated, voiceFailed, voiceReset, voiceStatusChanged } from '../state/voiceSlice';
import type { CompletedRecording } from '@/core/audio/audioTypes';

export function useVoiceRecorder() {
  const dispatch = useAppDispatch();
  const voice = useAppSelector((state) => state.voice);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);

  useEffect(() => {
    if (voice.status === 'recording')
      dispatch(
        recordingUpdated({ uri: recorder.uri, durationMillis: recorderState.durationMillis }),
      );
  }, [dispatch, recorder.uri, recorderState.durationMillis, voice.status]);

  const start = useCallback(async () => {
    try {
      dispatch(voiceStatusChanged('requesting_permission'));
      const permission = await requestMicrophonePermission();
      if (permission !== 'granted')
        throw new AppError(
          'PERMISSION_DENIED',
          'Microphone access is required to ask a voice question. You can still type your question.',
        );
      await startAudioRecording(recorder);
      dispatch(voiceStatusChanged('recording'));
    } catch (error: unknown) {
      dispatch(
        voiceFailed(error instanceof Error ? error.message : 'The microphone could not start.'),
      );
    }
  }, [dispatch, recorder]);

  const stop = useCallback(async (): Promise<CompletedRecording | null> => {
    try {
      dispatch(voiceStatusChanged('processing_audio'));
      const recording = await stopAudioRecording(recorder, recorderState.durationMillis);
      dispatch(recordingUpdated(recording));
      return recording;
    } catch (error: unknown) {
      dispatch(
        voiceFailed(
          error instanceof Error ? error.message : 'The recording could not be completed.',
        ),
      );
      return null;
    }
  }, [dispatch, recorder, recorderState.durationMillis]);

  const cancel = useCallback(async () => {
    await cancelAudioRecording(recorder);
    dispatch(voiceReset());
  }, [dispatch, recorder]);

  return { ...voice, start, stop, cancel };
}
