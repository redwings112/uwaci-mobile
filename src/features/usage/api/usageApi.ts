import { baseApi } from '@/core/api/baseApi';
import { type ApiResponse, unwrapApiResponse } from '@/core/api/apiTypes';

export type UsageStatus = 'active' | 'approaching_limit' | 'exhausted' | 'configuration_required';

export interface MyUsage {
  plan: {
    code: 'free' | string;
    display_name: string;
  };
  period: {
    starts_at: string | null;
    ends_at: string | null;
  };
  credits: {
    allocated: string;
    used: string;
    reserved: string;
    remaining: string;
    percentage_used: string;
  };
  status: UsageStatus;
}

export const MY_USAGE_PATH = '/usage/me' as const;

export const usageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyUsage: builder.query<MyUsage, void>({
      query: () => MY_USAGE_PATH,
      transformResponse: (response: ApiResponse<MyUsage>) => unwrapApiResponse(response),
      providesTags: ['Usage'],
    }),
  }),
});

export const { useGetMyUsageQuery } = usageApi;
