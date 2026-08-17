import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { deleteTemporaryRecording } from '@/core/audio/audioRecorder';
import { VOICE_UPLOAD_TIMEOUT_MS } from '@/core/constants/audio';
import { mapApiError } from '@/core/errors/mapApiError';
import { logger } from '@/core/logging/logger';
import { useAppDispatch } from '@/store/hooks';

import { mapApiQueryResult } from '@/features/conversation/api/contracts';

import { executeVoiceStream, type VoiceStreamCallbacks } from '../api/voiceStream';
import { voiceFailed, voiceStatusChanged } from '../state/voiceSlice';
import type { VoiceQueryInput } from '../types';

export function useVoiceQuery() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const mounted = useRef(true);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      mounted.current = false;
      activeRequest.current?.abort();
      activeRequest.current = null;
    },
    [],
  );

  const abort = useCallback(() => {
    activeRequest.current?.abort();
    activeRequest.current = null;
    if (mounted.current) setIsLoading(false);
  }, []);

  const submit = useCallback(
    async (input: VoiceQueryInput, callbacks: VoiceStreamCallbacks = {}) => {
      dispatch(voiceStatusChanged('uploading'));
      activeRequest.current?.abort();
      const request = new AbortController();
      activeRequest.current = request;
      setIsLoading(true);
      const timeout = setTimeout(() => request.abort(), VOICE_UPLOAD_TIMEOUT_MS);
      try {
        const response = mapApiQueryResult(
          await executeVoiceStream(input, request.signal, callbacks),
        );
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
        clearTimeout(timeout);
        // Voice recordings are transient. Clean them after success, failure, or
        // cancellation so long-running sessions cannot fill the app cache.
        deleteTemporaryRecording(input.uri);
        if (activeRequest.current === request) {
          activeRequest.current = null;
          if (mounted.current) setIsLoading(false);
        }
      }
    },
    [dispatch],
  );

  return { submit, abort, isLoading };
}
