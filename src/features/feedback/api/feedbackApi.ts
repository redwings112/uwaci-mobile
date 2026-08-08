import { baseApi } from '@/core/api/baseApi';
import { type ApiResponse, unwrapApiResponse } from '@/core/api/apiTypes';

import type { FeedbackRequest } from '../types';

interface FeedbackResult {
  id: string;
  accepted: boolean;
}

export const feedbackApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitFeedback: builder.mutation<FeedbackResult, FeedbackRequest>({
      query: (body) => ({ url: '/feedback', method: 'POST', body }),
      transformResponse: (response: ApiResponse<FeedbackResult>) => unwrapApiResponse(response),
    }),
  }),
});

export const { useSubmitFeedbackMutation } = feedbackApi;
