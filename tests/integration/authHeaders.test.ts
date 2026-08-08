import * as SecureStore from 'expo-secure-store';

import { prepareHeaders } from '@/core/api/prepareHeaders';

describe('authentication header attachment', () => {
  it('attaches a stored access token without exposing refresh data', async () => {
    jest
      .mocked(SecureStore.getItemAsync)
      .mockResolvedValueOnce(
        JSON.stringify({ accessToken: 'test-access-token', refreshToken: 'private-refresh' }),
      );
    const headers = await prepareHeaders(new Headers());
    expect(headers.get('Authorization')).toBe('Bearer test-access-token');
    expect(headers.get('Authorization')).not.toContain('private-refresh');
  });
});
