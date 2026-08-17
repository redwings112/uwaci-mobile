import { splitAnswerHeadline } from '@/features/conversation/components/answerHeadline';

describe('splitAnswerHeadline', () => {
  it('lifts the opening sentence out of the answer', () => {
    const result = splitAnswerHeadline(
      'Avec $200 a Kinshasa, tu peux commencer un petit business. Voici un plan simple :\n\n1. Choisis un business',
    );

    expect(result.headline).toBe('Avec $200 a Kinshasa, tu peux commencer un petit business.');
    expect(result.body.startsWith('Voici un plan simple :')).toBe(true);
  });

  it('leaves answers that open with markup alone', () => {
    const content = '## Plan\n\nVoici un plan simple.';
    expect(splitAnswerHeadline(content)).toEqual({ headline: null, body: content });

    const list = '1. Choisis un business\n2. Achete intelligemment';
    expect(splitAnswerHeadline(list)).toEqual({ headline: null, body: list });
  });

  it('leaves a single sentence answer whole rather than emptying the body', () => {
    const content = 'Oui, tu peux commencer avec $200.';
    expect(splitAnswerHeadline(content)).toEqual({ headline: null, body: content });
  });

  it('declines headlines that are too long to read as one', () => {
    const long = `${'a'.repeat(200)}. Body follows here.`;
    expect(splitAnswerHeadline(long).headline).toBeNull();
  });
});
