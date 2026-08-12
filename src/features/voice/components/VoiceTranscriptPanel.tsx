import { ScrollView, Text, View } from 'react-native';

import type { ConversationMessage } from '@/features/conversation/types';
import { MarkdownMessage } from '@/features/conversation/components/MarkdownMessage';
import { SurfaceCard } from '@/shared/components/SurfaceCard/SurfaceCard';

export function VoiceTranscriptPanel({ messages }: { messages: ConversationMessage[] }) {
  return (
    <SurfaceCard className="mx-1 mt-3 overflow-hidden p-0">
      <View className="border-b border-border px-4 py-3">
        <Text className="text-sm font-semibold text-ink dark:text-white">Voice transcript</Text>
        <Text className="mt-0.5 text-xs text-muted">This stays hidden unless you open it.</Text>
      </View>
      <ScrollView className="max-h-52" contentContainerClassName="gap-3 p-4" nestedScrollEnabled>
        {messages.length ? (
          messages.map((message) => (
            <View key={message.id}>
              <Text className="text-xs font-semibold text-brand">
                {message.role === 'user' ? 'You' : 'Uwaci'}
              </Text>
              {message.role === 'assistant' ? (
                <View className="mt-1">
                  <MarkdownMessage content={message.content} />
                </View>
              ) : (
                <Text className="mt-1 text-sm leading-5 text-ink dark:text-white">
                  {message.content}
                </Text>
              )}
            </View>
          ))
        ) : (
          <Text className="text-sm text-muted">Your conversation will appear here.</Text>
        )}
      </ScrollView>
    </SurfaceCard>
  );
}
