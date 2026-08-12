import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { deleteTemporaryRecording } from '@/core/audio/audioRecorder';
import { mapApiError } from '@/core/errors/mapApiError';
import { logger } from '@/core/logging/logger';
import { useAppDispatch } from '@/store/hooks';

import { useSendVoiceQueryMutation } from '../api/voiceApi';
import { voiceFailed, voiceStatusChanged } from '../state/voiceSlice';
import type { VoiceQueryInput } from '../types';

export function useVoiceQuery() {
  const dispatch = useAppDispatch();
  const [sendVoiceQuery, result] = useSendVoiceQueryMutation();
  const mounted = useRef(true);
  const activeRequest = useRef<ReturnType<typeof sendVoiceQuery> | null>(null);

  useEffect(
    () => () => {
      mounted.current = false;
      activeRequest.current?.abort();
      activeRequest.current = null;
    },
    [],
  );

  const submit = useCallback(
    async (input: VoiceQueryInput) => {
      dispatch(voiceStatusChanged('uploading'));
      const request = sendVoiceQuery(input);
      activeRequest.current?.abort();
      activeRequest.current = request;
      try {
        const response = await request.unwrap();
        deleteTemporaryRecording(input.uri);
        if (mounted.current && activeRequest.current === request)
          dispatch(voiceStatusChanged('response_received'));
        return response;
      } catch (error: unknown) {
        const mapped = mapApiError(error);
        logger.warn('Voice query failed', {
          code: mapped.code,
          platform: Platform.OS,
          requestId: mapped.requestId,
          transportStatus:
            typeof mapped.details?.transportStatus === 'string'
              ? mapped.details.transportStatus
              : undefined,
          transportError:
            typeof mapped.details?.transportError === 'string'
              ? mapped.details.transportError
              : undefined,
        });
        if (mounted.current && activeRequest.current === request)
          dispatch(voiceFailed(mapped.message));
        throw mapped;
      } finally {
        if (activeRequest.current === request) activeRequest.current = null;
      }
    },
    [dispatch, sendVoiceQuery],
  );

  return { submit, ...result };
}
