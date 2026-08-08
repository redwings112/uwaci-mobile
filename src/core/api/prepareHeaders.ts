import { getAccessToken } from '@/core/auth/authSession';

export async function prepareHeaders(headers: Headers): Promise<Headers> {
  const token = await getAccessToken();
  headers.set('Accept', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
}
