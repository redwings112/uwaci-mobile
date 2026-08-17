import type { ConversationMessage } from '../types';
import { MessageBubble } from './MessageBubble';

export function UserMessage({
  message,
  audioUri,
}: {
  message: ConversationMessage;
  audioUri?: string;
}) {
  return <MessageBubble message={message} {...(audioUri ? { audioUri } : {})} />;
}
