import { getThinkingPrompt } from '@/features/voice/voicePrompts';

describe('voice thinking prompts', () => {
  it('rotates natural acknowledgements instead of repeating one phrase', () => {
    const prompts = [0, 1, 2].map((turn) => getThinkingPrompt('en', turn));
    expect(new Set(prompts).size).toBe(3);
    expect(getThinkingPrompt('en', 3)).toBe(prompts[0]);
  });

  it('uses the active conversation language', () => {
    expect(getThinkingPrompt('fr', 0)).toContain('réfléchir');
    expect(getThinkingPrompt('sw', 0)).toContain('nifikirie');
  });
});
