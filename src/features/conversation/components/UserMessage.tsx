import type { ConversationMessage } from '../types';
import { MessageBubble } from './MessageBubble';

export function UserMessage({ message }: { message: ConversationMessage }) {
  return <MessageBubble message={message} />;
}
