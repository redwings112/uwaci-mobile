import { useCallback } from 'react';

import { deleteTemporaryRecording } from '@/core/audio/audioRecorder';
import { mapApiError } from '@/core/errors/mapApiError';
import { useAppDispatch } from '@/store/hooks';

import { useSendVoiceQueryMutation } from '../api/voiceApi';
import { voiceFailed, voiceStatusChanged } from '../state/voiceSlice';
import type { VoiceQueryInput } from '../types';

export function useVoiceQuery() {
  const dispatch = useAppDispatch();
  const [sendVoiceQuery, result] = useSendVoiceQueryMutation();

  const submit = useCallback(
    async (input: VoiceQueryInput) => {
      dispatch(voiceStatusChanged('uploading'));
      try {
        const response = await sendVoiceQuery(input).unwrap();
        deleteTemporaryRecording(input.uri);
        dispatch(voiceStatusChanged('response_received'));
        return response;
      } catch (error: unknown) {
        const mapped = mapApiError(error);
        dispatch(voiceFailed(mapped.message));
        throw mapped;
      }
    },
    [dispatch, sendVoiceQuery],
  );

  return { submit, ...result };
}
