import {
  MAX_IN_MEMORY_MESSAGES,
  conversationReducer,
  messageAdded,
  messageReconciled,
  requestFailed,
  requestStarted,
} from '@/features/conversation/state/conversationSlice';
import { selectConversationRequest } from '@/features/conversation/state/selectors';
import type { RootState } from '@/store';

const message = {
  id: 'm1',
  role: 'user' as const,
  content: 'Bonjour',
  createdAt: '2026-01-01T00:00:00Z',
};

describe('conversation reducer', () => {
  it('deduplicates messages and tracks request failures', () => {
    let state = conversationReducer(undefined, messageAdded(message));
    state = conversationReducer(state, messageAdded(message));
    state = conversationReducer(state, requestStarted());
    expect(state.messages).toHaveLength(1);
    expect(state.requestStatus).toBe('sending');
    state = conversationReducer(state, requestFailed('Try again'));
    expect(state).toMatchObject({ requestStatus: 'error', errorMessage: 'Try again' });
  });

  it('reconciles an optimistic message with the canonical backend message', () => {
    let state = conversationReducer(undefined, messageAdded({ ...message, id: 'local-1' }));
    state = conversationReducer(
      state,
      messageReconciled({ optimisticId: 'local-1', message: { ...message, id: 'server-1' } }),
    );
    expect(state.messages).toEqual([{ ...message, id: 'server-1' }]);
  });

  it('returns a stable request selector reference while request state is unchanged', () => {
    const state = {
      conversation: conversationReducer(undefined, { type: 'test/initialized' }),
    } as RootState;
    const first = selectConversationRequest(state);
    const second = selectConversationRequest(state);

    expect(second).toBe(first);
  });

  it('bounds long sessions while retaining the newest messages', () => {
    let state = conversationReducer(undefined, { type: 'test/initialized' });
    for (let index = 0; index <= MAX_IN_MEMORY_MESSAGES; index += 1) {
      state = conversationReducer(
        state,
        messageAdded({ ...message, id: `message-${index}`, content: String(index) }),
      );
    }
    expect(state.messages).toHaveLength(MAX_IN_MEMORY_MESSAGES);
    expect(state.messages[0]?.content).toBe('1');
    expect(state.messages.at(-1)?.content).toBe(String(MAX_IN_MEMORY_MESSAGES));
  });
});
