import type { UwaciLanguageCode } from '@/core/constants/languages';

export type MessageRole = 'user' | 'assistant';
export type MessageInputMethod = 'voice' | 'text';

export interface ConversationMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  inputMethod?: MessageInputMethod;
  language?: {
    preferred?: UwaciLanguageCode | null;
    primary?: string | null;
    detected?: string[];
    codeSwitchingDetected?: boolean;
  };
  transcription?: { confidence?: number | null };
}

export interface Conversation {
  id: string;
  preferredLanguage: UwaciLanguageCode;
  title?: string | null;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface QueryResult {
  conversationId: string;
  userMessage: ConversationMessage;
  assistantMessage: ConversationMessage;
  transcription?: {
    transcript: string;
    confidence?: number | null;
    primaryLanguage?: string | null;
    detectedLanguages: string[];
    codeSwitchingDetected: boolean;
  };
  voiceAction?: {
    type: 'language_changed';
    language: UwaciLanguageCode;
  };
}
