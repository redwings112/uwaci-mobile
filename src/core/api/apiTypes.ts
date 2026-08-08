export interface ApiMeta {
  request_id: string;
  timestamp?: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiFailure {
  success: false;
  error: { code: string; message: string; details: unknown };
  meta: ApiMeta;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  if (response.success) return response.data;
  throw response;
}
