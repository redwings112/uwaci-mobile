import type { UwaciLanguageCode } from '@/core/constants/languages';

import type { Conversation, ConversationMessage, QueryResult } from '../types';

export interface ApiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  input_mode: 'voice' | 'text';
  primary_language: string | null;
  created_at: string;
}

export interface ApiConversation {
  id: string;
  preferred_language: UwaciLanguageCode;
  title: string | null;
  messages: ApiMessage[];
  created_at: string;
  updated_at: string;
}

interface ApiLanguageMetadata {
  preferred_language: UwaciLanguageCode | null;
  primary_language: string | null;
  detected_languages: string[];
  code_switching_detected: boolean;
}

interface ApiTranscription {
  transcript: string;
  confidence: number | null;
  primary_language: string | null;
  detected_languages: string[];
  code_switching_detected: boolean;
}

interface ApiVoiceAction {
  type: 'language_changed';
  language: UwaciLanguageCode;
}

export interface ApiQueryResult {
  conversation_id: string;
  user_message: ApiMessage;
  assistant_message: ApiMessage;
  language: ApiLanguageMetadata;
  transcription: ApiTranscription | null;
  voice_action?: ApiVoiceAction | null;
  thinking?: {
    name: 'transcribing' | 'reasoning' | 'saving';
    status: 'completed';
    duration_ms: number;
  }[];
}

export function mapApiMessage(message: ApiMessage): ConversationMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.created_at,
    inputMethod: message.input_mode,
    language: { primary: message.primary_language },
  };
}

export function mapApiConversation(conversation: ApiConversation): Conversation {
  return {
    id: conversation.id,
    preferredLanguage: conversation.preferred_language,
    title: conversation.title,
    messages: conversation.messages.map(mapApiMessage),
    createdAt: conversation.created_at,
    updatedAt: conversation.updated_at,
  };
}

export function mapApiQueryResult(result: ApiQueryResult): QueryResult {
  const language = {
    preferred: result.language.preferred_language,
    primary: result.language.primary_language,
    detected: result.language.detected_languages,
    codeSwitchingDetected: result.language.code_switching_detected,
  };
  const userMessage = mapApiMessage(result.user_message);
  userMessage.language = language;
  if (result.transcription) {
    userMessage.transcription = { confidence: result.transcription.confidence };
  }
  const assistantMessage = mapApiMessage(result.assistant_message);
  assistantMessage.language = { preferred: result.language.preferred_language };
  return {
    conversationId: result.conversation_id,
    userMessage,
    assistantMessage,
    ...(result.transcription
      ? {
          transcription: {
            transcript: result.transcription.transcript,
            confidence: result.transcription.confidence,
            primaryLanguage: result.transcription.primary_language,
            detectedLanguages: result.transcription.detected_languages,
            codeSwitchingDetected: result.transcription.code_switching_detected,
          },
        }
      : {}),
    ...(result.voice_action ? { voiceAction: result.voice_action } : {}),
    processing: (result.thinking ?? []).map((stage) => ({
      name: stage.name,
      durationMs: stage.duration_ms,
    })),
  };
}
