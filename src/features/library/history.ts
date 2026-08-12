import type { Conversation } from '@/features/conversation/types';

export interface HistoryEntry {
  conversationId: string;
  title: string;
  preview: string;
  updatedAt: string;
}

export function conversationToHistoryEntry(conversation: Conversation): HistoryEntry {
  const latestUser = [...conversation.messages]
    .reverse()
    .find((message) => message.role === 'user');
  const latestAssistant = [...conversation.messages]
    .reverse()
    .find((message) => message.role === 'assistant');
  return {
    conversationId: conversation.id,
    title: conversation.title?.trim() || latestUser?.content.slice(0, 48) || 'Uwaci conversation',
    preview: latestAssistant?.content || latestUser?.content || 'Continue this conversation.',
    updatedAt: conversation.updatedAt,
  };
}
