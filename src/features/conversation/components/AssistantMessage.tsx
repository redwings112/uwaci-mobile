import { View } from 'react-native';

import { IconButton } from '@/shared/components/IconButton/IconButton';
import { getLanguage } from '@/core/constants/languages';
import { speechService } from '@/core/speech/speechService';
import { useAppSelector } from '@/store/hooks';

import type { ConversationMessage } from '../types';
import { MessageBubble } from './MessageBubble';

export function AssistantMessage({ message }: { message: ConversationMessage }) {
  const language = useAppSelector((state) => state.language.preferredConversationLanguage);
  return (
    <View>
      <MessageBubble message={message} />
      <IconButton
        className="mb-2 bg-brand/10"
        icon="▶"
        label="Hear this answer"
        onPress={() =>
          void speechService.speak(message.content, {
            language: getLanguage(language).speechLocale,
          })
        }
      />
    </View>
  );
}
