import { resolveSpeechLanguage } from '@/core/speech/speechService';

describe('device speech language selection', () => {
  it('uses an exact locale and falls back to a compatible base language', () => {
    const voices = [{ language: 'en-GB' }, { language: 'fr-FR' }];
    expect(resolveSpeechLanguage('fr-FR', voices)).toBe('fr-FR');
    expect(resolveSpeechLanguage('en-US', voices)).toBe('en-GB');
  });

  it('returns a text-only fallback when no compatible voice is installed', () => {
    expect(resolveSpeechLanguage('ln-CD', [{ language: 'en-US' }])).toBeNull();
  });
});
