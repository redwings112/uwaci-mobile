import { useLocalSearchParams } from 'expo-router';

import { ConversationScreen } from '@/features/conversation/components/ConversationScreen';

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function ConversationRoute() {
  const params = useLocalSearchParams<{
    conversationId: string;
    initialText?: string;
    startRecording?: string;
    focusComposer?: string;
  }>();
  return (
    <ConversationScreen
      conversationId={first(params.conversationId) ?? 'new'}
      {...(first(params.initialText) ? { initialText: first(params.initialText)! } : {})}
      startRecording={first(params.startRecording) === 'true'}
      focusComposer={first(params.focusComposer) === 'true'}
    />
  );
}
