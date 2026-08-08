import { FlatList } from 'react-native';

import { EmptyState } from '@/shared/components/EmptyState/EmptyState';

import type { ConversationMessage } from '../types';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';

export function ConversationList({ messages }: { messages: ConversationMessage[] }) {
  return (
    <FlatList
      className="flex-1"
      contentContainerClassName="grow px-5 py-4"
      data={messages}
      keyExtractor={(message) => message.id}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={
        <EmptyState
          title="Start a conversation"
          message="Speak or type a question. You can use more than one language."
        />
      }
      renderItem={({ item }) =>
        item.role === 'user' ? <UserMessage message={item} /> : <AssistantMessage message={item} />
      }
    />
  );
}
