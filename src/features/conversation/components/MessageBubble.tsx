import { View } from 'react-native';

import { Typography } from '@/shared/components/Typography/Typography';

import type { ConversationMessage } from '../types';

export function MessageBubble({ message }: { message: ConversationMessage }) {
  const user = message.role === 'user';
  return (
    <View
      className={`mb-3 max-w-[88%] rounded-card px-4 py-3 ${user ? 'self-end rounded-br-md bg-brand' : 'self-start rounded-bl-md border border-border bg-surface'}`}
      accessibilityLabel={`${user ? 'You said' : 'Uwaci answered'}: ${message.content}`}
    >
      <Typography className={user ? 'text-white' : 'text-ink'}>{message.content}</Typography>
      {message.transcription?.confidence != null ? (
        <Typography variant="caption" className={user ? 'mt-2 text-white/70' : 'mt-2'}>
          Transcription confidence {Math.round(message.transcription.confidence * 100)}%
        </Typography>
      ) : null}
    </View>
  );
}
