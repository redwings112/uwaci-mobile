import { baseApi } from '@/core/api/baseApi';
import { type ApiResponse, unwrapApiResponse } from '@/core/api/apiTypes';
import { VOICE_FILE_NAME, VOICE_MIME_TYPE } from '@/core/constants/audio';
import { type ApiQueryResult, mapApiQueryResult } from '@/features/conversation/api/contracts';
import type { QueryResult } from '@/features/conversation/types';

import type { VoiceQueryInput } from '../types';

function createVoiceFormData(input: VoiceQueryInput): FormData {
  const form = new FormData();
  form.append('audio', {
    uri: input.uri,
    name: VOICE_FILE_NAME,
    type: VOICE_MIME_TYPE,
  } as unknown as Blob);
  form.append('preferred_language', input.preferredLanguage);
  if (input.conversationId) form.append('conversation_id', input.conversationId);
  return form;
}

export const voiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendVoiceQuery: builder.mutation<QueryResult, VoiceQueryInput>({
      query: (input) => ({ url: '/voice/query', method: 'POST', body: createVoiceFormData(input) }),
      transformResponse: (response: ApiResponse<ApiQueryResult>) =>
        mapApiQueryResult(unwrapApiResponse(response)),
      invalidatesTags: (_result, _error, request) =>
        request.conversationId
          ? [{ type: 'Conversation', id: request.conversationId }]
          : ['Conversation'],
    }),
  }),
});

export const { useSendVoiceQueryMutation } = voiceApi;
