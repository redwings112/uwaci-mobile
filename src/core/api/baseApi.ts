import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { appConfig } from '@/app/config/appConfig';

import { prepareHeaders } from './prepareHeaders';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: `${appConfig.apiBaseUrl}/api/v1`, prepareHeaders }),
  tagTypes: ['Conversation', 'Health'],
  endpoints: (builder) => ({
    liveHealth: builder.query<{ status: string }, void>({
      query: () => '/health/live',
      providesTags: ['Health'],
    }),
  }),
});

export const { useLiveHealthQuery } = baseApi;
