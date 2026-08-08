import { textQuerySchema } from '@/features/text_input/utils/textQuerySchema';
import {
  conversationReducer,
  messageAdded,
  requestStarted,
} from '@/features/conversation/state/conversationSlice';

describe('text conversation flow', () => {
  it('validates input before adding an optimistic user message', () => {
    const parsed = textQuerySchema.safeParse('  Bonjour Uwaci  ');
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    let state = conversationReducer(undefined, requestStarted());
    state = conversationReducer(
      state,
      messageAdded({
        id: 'local',
        role: 'user',
        content: parsed.data,
        createdAt: 'now',
        inputMethod: 'text',
      }),
    );
    expect(state.messages[0]?.content).toBe('Bonjour Uwaci');
  });
});
