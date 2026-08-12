import { FlatList } from 'react-native';

import { EmptyState } from '@/shared/components/EmptyState/EmptyState';

import type { ConversationMessage } from '../types';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';

export function ConversationList({
  messages,
  conversationId,
}: {
  messages: ConversationMessage[];
  conversationId?: string;
}) {
  return (
    <FlatList
      automaticallyAdjustKeyboardInsets
      className="flex-1"
      contentContainerClassName="grow px-3 py-3"
      data={messages}
      keyExtractor={(message) => message.id}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={
        <EmptyState
          title="Ask anything"
          message="Speak or type naturally. Uwaci keeps voice and text in one conversation."
        />
      }
      renderItem={({ item }) =>
        item.role === 'user' ? (
          <UserMessage message={item} />
        ) : (
          <AssistantMessage message={item} {...(conversationId ? { conversationId } : {})} />
        )
      }
    />
  );
}
