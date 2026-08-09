import { baseApi } from '@/core/api/baseApi';
import { type ApiResponse, unwrapApiResponse } from '@/core/api/apiTypes';
import type { UwaciLanguageCode } from '@/core/constants/languages';

import {
  type ApiConversation,
  type ApiQueryResult,
  mapApiConversation,
  mapApiQueryResult,
} from './contracts';
import type { Conversation, QueryResult } from '../types';

interface CreateConversationRequest {
  preferred_language: UwaciLanguageCode;
}
interface TextQueryRequest {
  text: string;
  preferred_language: UwaciLanguageCode;
  conversation_id?: string;
}

export const conversationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createConversation: builder.mutation<Conversation, CreateConversationRequest>({
      query: (body) => ({ url: '/conversations', method: 'POST', body }),
      transformResponse: (response: ApiResponse<ApiConversation>) =>
        mapApiConversation(unwrapApiResponse(response)),
      invalidatesTags: ['Conversation'],
    }),
    getConversation: builder.query<Conversation, string>({
      query: (conversationId) => `/conversations/${conversationId}`,
      transformResponse: (response: ApiResponse<ApiConversation>) =>
        mapApiConversation(unwrapApiResponse(response)),
      providesTags: (_result, _error, id) => [{ type: 'Conversation', id }],
    }),
    sendTextQuery: builder.mutation<QueryResult, TextQueryRequest>({
      query: (body) => ({ url: '/text/query', method: 'POST', body }),
      transformResponse: (response: ApiResponse<ApiQueryResult>) =>
        mapApiQueryResult(unwrapApiResponse(response)),
      invalidatesTags: (_result, _error, request) =>
        request.conversation_id
          ? [{ type: 'Conversation', id: request.conversation_id }]
          : ['Conversation'],
    }),
  }),
});

export const { useCreateConversationMutation, useGetConversationQuery, useSendTextQueryMutation } =
  conversationApi;
