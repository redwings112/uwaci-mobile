import { conversationToHistoryEntry } from '@/features/library/history';

describe('conversation history mapping', () => {
  it('uses persisted messages for a useful title and preview', () => {
    const entry = conversationToHistoryEntry({
      id: 'conversation-1',
      preferredLanguage: 'en',
      title: null,
      messages: [
        {
          id: 'user-1',
          role: 'user',
          content: 'How can I price my products?',
          createdAt: '2026-08-12T10:00:00Z',
        },
        {
          id: 'assistant-1',
          role: 'assistant',
          content: 'Start with your costs and target margin.',
          createdAt: '2026-08-12T10:00:01Z',
        },
      ],
      createdAt: '2026-08-12T10:00:00Z',
      updatedAt: '2026-08-12T10:00:01Z',
    });

    expect(entry).toMatchObject({
      conversationId: 'conversation-1',
      title: 'How can I price my products?',
      preview: 'Start with your costs and target margin.',
    });
  });
});
