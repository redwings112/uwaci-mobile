import {
  conversationReducer,
  messageAdded,
  requestFailed,
  requestStarted,
} from '@/features/conversation/state/conversationSlice';

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
});
