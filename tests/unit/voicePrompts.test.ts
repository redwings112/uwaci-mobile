import { getThinkingPrompt } from '@/features/voice/voicePrompts';

describe('voice processing prompts', () => {
  it('describes the backend stage without fake thinking filler', () => {
    expect(getThinkingPrompt('en', 'transcribing')).toContain('Understanding');
    expect(getThinkingPrompt('en', 'reasoning')).toContain('answer');
    expect(getThinkingPrompt('en', 'reasoning').toLowerCase()).not.toContain('let me think');
  });

  it('uses the active conversation language', () => {
    expect(getThinkingPrompt('fr', 'reasoning')).toContain('réponse');
    expect(getThinkingPrompt('sw', 'transcribing')).toContain('Ninaelewa');
  });
});
