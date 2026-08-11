import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { appConfig } from '@/application/config/appConfig';

import { type ApiResponse, unwrapApiResponse } from './apiTypes';
import { prepareHeaders } from './prepareHeaders';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${appConfig.apiBaseUrl}/api/v1`,
    prepareHeaders,
    timeout: 30_000,
  }),
  tagTypes: ['Conversation', 'Health'],
  endpoints: (builder) => ({
    liveHealth: builder.query<{ status: string }, void>({
      query: () => '/health/live',
      transformResponse: (response: ApiResponse<{ status: string }>) => unwrapApiResponse(response),
      providesTags: ['Health'],
    }),
  }),
});

export const { useLiveHealthQuery } = baseApi;
