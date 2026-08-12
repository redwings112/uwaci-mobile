import * as Speech from 'expo-speech';

import {
  resolveSpeechLanguage,
  resolveSpeechVoice,
  speechService,
} from '@/core/speech/speechService';
import { prepareTextForSpeech } from '@/core/speech/speechText';

jest.mock('expo-speech', () => ({
  getAvailableVoicesAsync: jest.fn(async () => [
    { language: 'en-US', identifier: 'enhanced-en', quality: 'Enhanced' },
  ]),
  isSpeakingAsync: jest.fn(async () => false),
  pause: jest.fn(async () => undefined),
  resume: jest.fn(async () => undefined),
  speak: jest.fn(),
  stop: jest.fn(async () => undefined),
}));

describe('device speech language selection', () => {
  it('uses an exact locale and falls back to a compatible base language', () => {
    const voices = [{ language: 'en-GB' }, { language: 'fr-FR' }];
    expect(resolveSpeechLanguage('fr-FR', voices)).toBe('fr-FR');
    expect(resolveSpeechLanguage('en-US', voices)).toBe('en-GB');
  });

  it('returns a text-only fallback when no compatible voice is installed', () => {
    expect(resolveSpeechLanguage('ln-CD', [{ language: 'en-US' }])).toBeNull();
  });

  it('prefers an enhanced compatible device voice', () => {
    const voices = [
      { language: 'en-US', identifier: 'default', quality: 'Default' },
      { language: 'en-GB', identifier: 'enhanced', quality: 'Enhanced' },
    ];
    expect(resolveSpeechVoice('en-US', voices)?.identifier).toBe('enhanced');
  });
});

describe('speech-ready answer text', () => {
  beforeEach(() => jest.clearAllMocks());

  it('narrates headings without reading Markdown markers', () => {
    expect(prepareTextForSpeech('### ABOUT A BOY\n\n#### History of a Boy', 'en-US')).toBe(
      'Title. ABOUT A BOY. Subsection. History of a Boy.',
    );
  });

  it('treats a heading after introductory text as a section', () => {
    expect(prepareTextForSpeech('Here is the answer.\n\n### Background', 'en-US')).toBe(
      'Here is the answer. Section. Background.',
    );
  });

  it('removes quote, list, emphasis, link, and divider syntax', () => {
    const markdown = [
      '> **Important:** Keep learning.',
      '- Read [the guide](https://example.com).',
      '- Practice `daily`.',
      '---',
    ].join('\n');

    expect(prepareTextForSpeech(markdown, 'en-US')).toBe(
      'Important: Keep learning. Read the guide. Practice daily.',
    );
  });

  it('does not vocalize fenced source code', () => {
    expect(
      prepareTextForSpeech('## Example\n```ts\nconst answer = true;\n```\nIt works.', 'en-US'),
    ).toBe('Title. Example. It works.');
  });

  it('passes speech-ready text to the native speech engine', async () => {
    await speechService.speak('### About a Boy\n- A short history', { language: 'en-US' });

    expect(Speech.speak).toHaveBeenCalledWith(
      'Title. About a Boy. A short history.',
      expect.objectContaining({
        language: 'en-US',
        voice: 'enhanced-en',
        rate: 0.94,
        pitch: 1,
      }),
    );
  });
});
