import { Text, View } from 'react-native';

import { Typography } from '@/shared/components/Typography/Typography';

import type { ConversationMessage } from '../types';

export function MessageBubble({ message }: { message: ConversationMessage }) {
  const user = message.role === 'user';
  return (
    <View
      className={`mb-3 max-w-[88%] rounded-control px-4 py-3 ${user ? 'self-end bg-lavender' : 'self-start border border-border bg-surface'}`}
      accessibilityLabel={`${user ? 'You said' : 'Uwaci answered'}: ${message.content}`}
    >
      {user ? (
        <Text className="mb-1 text-xs font-medium text-muted">
          You ·{' '}
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </Text>
      ) : null}
      <Typography className="text-ink">{message.content}</Typography>
      {message.transcription?.confidence != null ? (
        <Typography variant="caption" className="mt-2">
          Transcription confidence {Math.round(message.transcription.confidence * 100)}%
        </Typography>
      ) : null}
      {user && message.inputMethod === 'voice' ? (
        <View className="mt-2 h-6 w-6 items-center justify-center self-end rounded-full bg-surface">
          <Text className="text-xs text-brand">▶</Text>
        </View>
      ) : null}
    </View>
  );
}
