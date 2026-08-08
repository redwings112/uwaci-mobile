import {
  conversationReducer,
  messageAdded,
  requestFinished,
  requestStarted,
} from '@/features/conversation/state/conversationSlice';
import { voiceReducer, voiceStatusChanged } from '@/features/voice/state/voiceSlice';

describe('voice request state flow', () => {
  it('coordinates voice processing with conversation messages', () => {
    let voice = voiceReducer(undefined, voiceStatusChanged('recording'));
    voice = voiceReducer(voice, voiceStatusChanged('uploading'));
    let conversation = conversationReducer(undefined, requestStarted());
    conversation = conversationReducer(
      conversation,
      messageAdded({ id: 'answer', role: 'assistant', content: 'Response', createdAt: 'now' }),
    );
    conversation = conversationReducer(conversation, requestFinished());
    voice = voiceReducer(voice, voiceStatusChanged('response_received'));
    expect(voice.status).toBe('response_received');
    expect(conversation.messages[0]?.content).toBe('Response');
    expect(conversation.requestStatus).toBe('idle');
  });
});
