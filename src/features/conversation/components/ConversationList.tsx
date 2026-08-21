import { useRef } from 'react';
import { FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const list = useRef<FlatList<ConversationMessage>>(null);
  const scrollToLatest = () => {
    if (!messages.length) return;
    requestAnimationFrame(() => list.current?.scrollToEnd({ animated: true }));
  };
  return (
    <FlatList
      ref={list}
      className="flex-1"
      onContentSizeChange={scrollToLatest}
      contentContainerClassName="grow px-3 py-3"
      data={messages}
      keyExtractor={(message) => message.id}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={
        <EmptyState title={t('conversation.emptyTitle')} message={t('conversation.emptyMessage')} />
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
