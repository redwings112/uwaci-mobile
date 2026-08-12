import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { File, UploadType, type UploadResult } from 'expo-file-system';
import { Platform } from 'react-native';

import { appConfig } from '@/application/config/appConfig';
import { getAccessToken } from '@/core/auth/authSession';
import { getVoiceUploadMetadata } from '@/core/constants/audio';
import { getNetworkState } from '@/core/network/networkInfo';

import type { VoiceQueryInput } from '../types';

export interface VoiceUploadResult {
  status: number;
  body: string;
}

export type VoiceUploadTransportError = Extract<FetchBaseQueryError, { status: 'CUSTOM_ERROR' }>;

function createErrorData(
  code: 'INVALID_AUDIO' | 'NETWORK_ERROR' | 'AUDIO_UPLOAD_FAILED',
  details?: Record<string, unknown>,
) {
  return { error: { code, ...(details ? { details } : {}) } };
}

export function parseVoiceResponseBody(body: string): unknown {
  if (!body) return null;
  try {
    return JSON.parse(body) as unknown;
  } catch {
    return body;
  }
}

async function uploadWithBrowserFetch(
  input: VoiceQueryInput,
  signal: AbortSignal,
  headers: Record<string, string>,
): Promise<VoiceUploadResult> {
  const source = await fetch(input.uri, { signal });
  if (!source.ok) throw new Error(`Recorded audio could not be read (${source.status}).`);
  const blob = await source.blob();
  const form = new FormData();
  const upload = getVoiceUploadMetadata();
  form.append('audio', blob, upload.fileName);
  form.append('preferred_language', input.preferredLanguage);
  if (input.conversationId) form.append('conversation_id', input.conversationId);
  const response = await fetch(`${appConfig.apiBaseUrl}/api/v1/voice/query`, {
    method: 'POST',
    headers,
    body: form,
    signal,
  });
  return { status: response.status, body: await response.text() };
}

async function uploadWithNativeFileSystem(
  input: VoiceQueryInput,
  signal: AbortSignal,
  headers: Record<string, string>,
): Promise<UploadResult> {
  const file = new File(input.uri);
  if (!file.exists || file.size <= 0) {
    return {
      status: 422,
      headers: {},
      body: JSON.stringify(createErrorData('INVALID_AUDIO')),
    };
  }
  const upload = getVoiceUploadMetadata();
  return file.upload(`${appConfig.apiBaseUrl}/api/v1/voice/query`, {
    httpMethod: 'POST',
    uploadType: UploadType.MULTIPART,
    fieldName: 'audio',
    mimeType: upload.mimeType,
    headers,
    parameters: {
      preferred_language: input.preferredLanguage,
      ...(input.conversationId ? { conversation_id: input.conversationId } : {}),
    },
    signal,
  });
}

export async function executeVoiceUpload(
  input: VoiceQueryInput,
  signal: AbortSignal,
): Promise<VoiceUploadResult | VoiceUploadTransportError> {
  const token = await getAccessToken();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    return Platform.OS === 'web'
      ? await uploadWithBrowserFetch(input, signal, headers)
      : await uploadWithNativeFileSystem(input, signal, headers);
  } catch (error: unknown) {
    const network = await getNetworkState().catch(() => null);
    const actuallyOffline = network?.isConnected === false && network.isInternetReachable === false;
    const message = error instanceof Error ? error.message : 'Native audio upload failed';
    const name = error instanceof Error ? error.name : 'UnknownError';
    return {
      status: 'CUSTOM_ERROR',
      error: message,
      data: createErrorData(actuallyOffline ? 'NETWORK_ERROR' : 'AUDIO_UPLOAD_FAILED', {
        nativeError: name,
        platform: Platform.OS,
      }),
    };
  }
}
