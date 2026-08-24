import { fetch as expoFetch } from 'expo/fetch';
import { File } from 'expo-file-system';
import { Platform } from 'react-native';

import { appConfig } from '@/application/config/appConfig';
import { type ApiResponse, unwrapApiResponse } from '@/core/api/apiTypes';
import { getAccessToken } from '@/core/auth/authSession';
import { getVoiceUploadMetadata } from '@/core/constants/audio';
import type { ApiQueryResult } from '@/features/conversation/api/contracts';

import type { VoiceQueryInput, VoiceThinkingStage } from '../types';
import { executeVoiceUpload, parseVoiceResponseBody } from './voiceUpload';
import { i18n } from '@/localization';

export interface VoiceStreamCallbacks {
  onStage?: (event: {
    stage: VoiceThinkingStage;
    status: 'active' | 'completed';
    durationMs?: number;
  }) => void;
  onTranscript?: (text: string) => void;
  onDelta?: (text: string) => void;
}

type StreamEvent =
  | {
      type: 'stage';
      stage: VoiceThinkingStage;
      status: 'active' | 'completed';
      duration_ms?: number;
    }
  | { type: 'transcript'; text: string }
  | { type: 'delta'; text: string }
  | { type: 'complete'; data: ApiQueryResult }
  | {
      type: 'error';
      error: { code: string; message: string; details?: unknown };
      request_id?: string;
    };

function parseEvent(line: string): StreamEvent {
  return JSON.parse(line) as StreamEvent;
}

function createVoiceTurnIdempotencyKey(): string {
  return `voice-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

async function createForm(input: VoiceQueryInput): Promise<FormData> {
  const form = new FormData();
  const upload = getVoiceUploadMetadata();
  if (Platform.OS === 'web') {
    const source = await fetch(input.uri);
    if (!source.ok) throw new Error(`Recorded audio could not be read (${source.status}).`);
    form.append('audio', await source.blob(), upload.fileName);
  } else {
    const file = new File(input.uri);
    if (!file.exists || file.size <= 0) throw new Error(i18n.t('errors.recordingEmpty'));
    form.append('audio', file, upload.fileName);
  }
  form.append('preferred_language', input.preferredLanguage);
  if (input.conversationId) form.append('conversation_id', input.conversationId);
  return form;
}

export async function executeVoiceStream(
  input: VoiceQueryInput,
  signal: AbortSignal,
  callbacks: VoiceStreamCallbacks = {},
): Promise<ApiQueryResult> {
  const token = await getAccessToken();
  const form = await createForm(input);
  const idempotencyKey = createVoiceTurnIdempotencyKey();
  const response = await expoFetch(`${appConfig.apiBaseUrl}/api/v1/voice/query/stream`, {
    method: 'POST',
    headers: {
      Accept: 'application/x-ndjson',
      'Idempotency-Key': idempotencyKey,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
    signal,
  });
  if (response.status === 404 || response.status === 405) {
    const fallback = await executeVoiceUpload(input, signal, idempotencyKey);
    if ('error' in fallback && typeof fallback.status === 'string') throw fallback;
    const fallbackBody = parseVoiceResponseBody(fallback.body);
    if (fallback.status < 200 || fallback.status >= 300) {
      throw { status: fallback.status, data: fallbackBody };
    }
    return unwrapApiResponse(fallbackBody as ApiResponse<ApiQueryResult>);
  }
  if (!response.ok || !response.body) {
    const data = await response.text();
    throw { status: response.status, data };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = '';
  let completed: ApiQueryResult | null = null;
  const handleLine = (line: string) => {
    if (!line.trim()) return;
    const event = parseEvent(line);
    if (event.type === 'stage') {
      callbacks.onStage?.({
        stage: event.stage,
        status: event.status,
        ...(event.duration_ms != null ? { durationMs: event.duration_ms } : {}),
      });
    } else if (event.type === 'transcript') callbacks.onTranscript?.(event.text);
    else if (event.type === 'delta') callbacks.onDelta?.(event.text);
    else if (event.type === 'complete') completed = event.data;
    else
      throw {
        status: 500,
        data: {
          error: event.error,
          ...(event.request_id ? { meta: { request_id: event.request_id } } : {}),
        },
      };
  };

  while (true) {
    const { value, done } = await reader.read();
    pending += decoder.decode(value, { stream: !done });
    const lines = pending.split('\n');
    pending = lines.pop() ?? '';
    lines.forEach(handleLine);
    if (done) break;
  }
  if (pending.trim()) handleLine(pending);
  if (!completed) throw new Error(i18n.t('errors.streamIncomplete'));
  return completed;
}
