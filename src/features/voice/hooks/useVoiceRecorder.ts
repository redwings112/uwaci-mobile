import { useCallback, useEffect, useRef } from 'react';
import { RecordingPresets, useAudioRecorder, useAudioRecorderState } from 'expo-audio';

import {
  cancelAudioRecording,
  deactivateRecordingAudioMode,
  deleteTemporaryRecording,
  isReleasedAudioRecorderError,
  startAudioRecording,
  stopAudioRecording,
} from '@/core/audio/audioRecorder';
import { normalizeAudioLevel } from '@/core/audio/audioMetering';
import { requestMicrophonePermission } from '@/core/audio/audioPermissions';
import { AppError } from '@/core/errors/AppError';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { recordingUpdated, voiceFailed, voiceReset, voiceStatusChanged } from '../state/voiceSlice';
import type { CompletedRecording } from '@/core/audio/audioTypes';

const recordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
};

export function useVoiceRecorder() {
  const dispatch = useAppDispatch();
  const voice = useAppSelector((state) => state.voice);
  const recorder = useAudioRecorder(recordingOptions);
  const recorderState = useAudioRecorderState(recorder, 100);
  const mounted = useRef(true);
  const operationInProgress = useRef(false);
  const session = useRef(0);

  useEffect(() => {
    if (voice.status === 'recording')
      dispatch(
        recordingUpdated({ uri: recorder.uri, durationMillis: recorderState.durationMillis }),
      );
  }, [dispatch, recorder.uri, recorderState.durationMillis, voice.status]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      session.current += 1;
      void deactivateRecordingAudioMode().catch(() => undefined);
      dispatch(voiceReset());
    };
  }, [dispatch, recorder]);

  const start = useCallback(async () => {
    if (operationInProgress.current || recorderState.isRecording) return false;
    operationInProgress.current = true;
    const currentSession = ++session.current;
    try {
      deleteTemporaryRecording(voice.recordingUri);
      dispatch(recordingUpdated({ uri: null, durationMillis: 0 }));
      dispatch(voiceStatusChanged('requesting_permission'));
      const permission = await requestMicrophonePermission();
      if (permission !== 'granted')
        throw new AppError(
          'PERMISSION_DENIED',
          'Microphone access is required to ask a voice question. You can still type your question.',
        );
      await startAudioRecording(recorder);
      if (mounted.current && currentSession === session.current)
        dispatch(voiceStatusChanged('recording'));
      return true;
    } catch (error: unknown) {
      await cancelAudioRecording(recorder).catch(() => undefined);
      if (mounted.current && currentSession === session.current)
        dispatch(
          voiceFailed(error instanceof Error ? error.message : 'The microphone could not start.'),
        );
      return false;
    } finally {
      operationInProgress.current = false;
    }
  }, [dispatch, recorder, recorderState.isRecording, voice.recordingUri]);

  const stop = useCallback(async (): Promise<CompletedRecording | null> => {
    if (operationInProgress.current) return null;
    operationInProgress.current = true;
    const currentSession = session.current;
    try {
      dispatch(voiceStatusChanged('stopping'));
      const recording = await stopAudioRecording(recorder);
      if (!mounted.current || currentSession !== session.current) return null;
      dispatch(recordingUpdated(recording));
      dispatch(voiceStatusChanged('processing_audio'));
      return recording;
    } catch (error: unknown) {
      if (
        mounted.current &&
        currentSession === session.current &&
        !isReleasedAudioRecorderError(error)
      )
        dispatch(
          voiceFailed(
            error instanceof Error ? error.message : 'The recording could not be completed.',
          ),
        );
      return null;
    } finally {
      operationInProgress.current = false;
    }
  }, [dispatch, recorder]);

  const cancel = useCallback(async () => {
    session.current += 1;
    if (operationInProgress.current) return;
    operationInProgress.current = true;
    try {
      await cancelAudioRecording(recorder);
    } catch (error: unknown) {
      if (mounted.current && !isReleasedAudioRecorderError(error))
        dispatch(
          voiceFailed(
            error instanceof Error ? error.message : 'The recording could not be cancelled.',
          ),
        );
    } finally {
      operationInProgress.current = false;
      if (mounted.current) dispatch(voiceReset());
    }
  }, [dispatch, recorder]);

  return {
    ...voice,
    audioLevel: normalizeAudioLevel(recorderState.metering),
    start,
    stop,
    cancel,
  };
}
