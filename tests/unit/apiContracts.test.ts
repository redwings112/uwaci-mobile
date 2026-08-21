import { mapApiConversation, mapApiQueryResult } from '@/features/conversation/api/contracts';

const userMessage = {
  id: 'user-1',
  role: 'user' as const,
  content: 'Bonjour hello',
  input_mode: 'voice' as const,
  primary_language: 'fr',
  created_at: '2026-08-09T10:00:00Z',
};

const assistantMessage = {
  id: 'assistant-1',
  role: 'assistant' as const,
  content: 'Réponse',
  input_mode: 'voice' as const,
  primary_language: 'fr',
  created_at: '2026-08-09T10:00:01Z',
};

describe('backend API contract mapping', () => {
  it('maps snake_case conversations into app domain models', () => {
    const result = mapApiConversation({
      id: 'conversation-1',
      preferred_language: 'fr',
      title: null,
      messages: [userMessage],
      created_at: '2026-08-09T10:00:00Z',
      updated_at: '2026-08-09T10:00:01Z',
    });
    expect(result.preferredLanguage).toBe('fr');
    expect(result.messages[0]?.createdAt).toBe('2026-08-09T10:00:00Z');
    expect(result.messages[0]?.inputMethod).toBe('voice');
  });

  it('preserves code-switching and transcription confidence', () => {
    const result = mapApiQueryResult({
      correlation_id: '11111111-1111-4111-8111-111111111111',
      conversation_id: 'conversation-1',
      user_message: userMessage,
      assistant_message: assistantMessage,
      language: {
        preferred_language: 'fr',
        primary_language: 'fr',
        detected_languages: ['fr', 'en'],
        code_switching_detected: true,
      },
      transcription: {
        transcript: 'Bonjour hello',
        confidence: 0.91,
        primary_language: 'fr',
        detected_languages: ['fr', 'en'],
        code_switching_detected: true,
      },
    });
    expect(result.conversationId).toBe('conversation-1');
    expect(result.correlationId).toBe('11111111-1111-4111-8111-111111111111');
    expect(result.userMessage.language?.detected).toEqual(['fr', 'en']);
    expect(result.userMessage.transcription?.confidence).toBe(0.91);
    expect(result.transcription?.codeSwitchingDetected).toBe(true);
  });

  it('maps a structured voice language action', () => {
    const result = mapApiQueryResult({
      conversation_id: 'conversation-1',
      user_message: userMessage,
      assistant_message: assistantMessage,
      language: {
        preferred_language: 'fr',
        primary_language: 'en',
        detected_languages: ['en'],
        code_switching_detected: false,
      },
      transcription: null,
      voice_action: { type: 'language_changed', language: 'fr' },
    });

    expect(result.voiceAction).toEqual({ type: 'language_changed', language: 'fr' });
  });
});
