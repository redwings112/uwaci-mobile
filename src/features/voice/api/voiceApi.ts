import { type ApiResponse, unwrapApiResponse } from '@/core/api/apiTypes';
import { baseApi } from '@/core/api/baseApi';
import { type ApiQueryResult, mapApiQueryResult } from '@/features/conversation/api/contracts';
import type { QueryResult } from '@/features/conversation/types';

import { VOICE_UPLOAD_TIMEOUT_MS } from '@/core/constants/audio';

import type { VoiceQueryInput } from '../types';
import { executeVoiceUpload, parseVoiceResponseBody } from './voiceUpload';

export const voiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendVoiceQuery: builder.mutation<QueryResult, VoiceQueryInput>({
      queryFn: async (input, api) => {
        const controller = new AbortController();
        const abortUpload = () => controller.abort();
        api.signal.addEventListener('abort', abortUpload);
        const timeout = setTimeout(() => controller.abort(), VOICE_UPLOAD_TIMEOUT_MS);
        let result: Awaited<ReturnType<typeof executeVoiceUpload>>;
        try {
          result = await executeVoiceUpload(input, controller.signal);
        } finally {
          clearTimeout(timeout);
          api.signal.removeEventListener('abort', abortUpload);
        }
        if ('error' in result && typeof result.status === 'string') return { error: result };
        const responseData = parseVoiceResponseBody(result.body);
        if (result.status < 200 || result.status >= 300)
          return { error: { status: result.status, data: responseData } };
        try {
          return {
            data: mapApiQueryResult(unwrapApiResponse(responseData as ApiResponse<ApiQueryResult>)),
          };
        } catch (error: unknown) {
          return {
            error: {
              status: 'PARSING_ERROR',
              originalStatus: result.status,
              data: result.body,
              error: error instanceof Error ? error.message : 'Invalid voice response',
            },
          };
        }
      },
      invalidatesTags: (_result, _error, request) => [
        { type: 'Conversation', id: 'LIST' },
        'Usage',
        ...(request.conversationId
          ? [{ type: 'Conversation' as const, id: request.conversationId }]
          : []),
      ],
    }),
  }),
});

export const { useSendVoiceQueryMutation } = voiceApi;
