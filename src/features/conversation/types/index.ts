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
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface QueryResult {
  conversation_id: string;
  user_message: ConversationMessage;
  assistant_message: ConversationMessage;
  transcription?: string;
}
