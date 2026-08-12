import { Platform } from 'react-native';

import { getAccessToken } from '@/core/auth/authSession';
import { getNetworkState } from '@/core/network/networkInfo';
import { executeVoiceUpload } from '@/features/voice/api/voiceUpload';

const mockUpload = jest.fn();

jest.mock('expo-file-system', () => ({
  UploadType: { MULTIPART: 1 },
  File: jest.fn().mockImplementation(() => ({
    exists: true,
    size: 1024,
    upload: mockUpload,
  })),
}));

jest.mock('@/core/auth/authSession', () => ({ getAccessToken: jest.fn() }));
jest.mock('@/core/network/networkInfo', () => ({ getNetworkState: jest.fn() }));

const mockGetAccessToken = jest.mocked(getAccessToken);
const mockGetNetworkState = jest.mocked(getNetworkState);

describe('executeVoiceUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAccessToken.mockResolvedValue('access-token');
  });

  it('uses the native multipart uploader for a recorded file', async () => {
    expect(Platform.OS).not.toBe('web');
    mockUpload.mockResolvedValue({ status: 200, headers: {}, body: '{"data":{}}' });

    const result = await executeVoiceUpload(
      {
        uri: 'file:///recording.m4a',
        preferredLanguage: 'en',
        conversationId: 'conversation-1',
      },
      new AbortController().signal,
    );

    expect(result).toEqual({ status: 200, headers: {}, body: '{"data":{}}' });
    expect(mockUpload).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/voice\/query$/),
      expect.objectContaining({
        httpMethod: 'POST',
        fieldName: 'audio',
        mimeType: 'audio/x-m4a',
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer access-token',
        },
        parameters: {
          preferred_language: 'en',
          conversation_id: 'conversation-1',
        },
      }),
    );
  });

  it('does not label an upload transport failure as offline when connectivity is available', async () => {
    mockUpload.mockRejectedValue(new Error('UnableToUpload'));
    mockGetNetworkState.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });

    const result = await executeVoiceUpload(
      { uri: 'file:///recording.m4a', preferredLanguage: 'en' },
      new AbortController().signal,
    );

    expect(result).toMatchObject({
      status: 'CUSTOM_ERROR',
      data: { error: { code: 'AUDIO_UPLOAD_FAILED' } },
    });
  });
});
