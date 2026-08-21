import * as Speech from 'expo-speech';

import {
  resolveSpeechLanguage,
  resolveSpeechVoice,
  speechService,
} from '@/core/speech/speechService';
import { naturalSpeechService } from '@/core/speech/naturalSpeechService';
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

jest.mock('@/core/speech/naturalSpeechService', () => ({
  naturalSpeechService: {
    isAvailable: jest.fn(async () => false),
    play: jest.fn(async () => 'unavailable'),
    prepare: jest.fn(),
    prewarm: jest.fn(),
    stop: jest.fn(),
  },
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
      'ABOUT A BOY. History of a Boy.',
    );
  });

  it('treats a heading after introductory text as a section', () => {
    expect(prepareTextForSpeech('Here is the answer.\n\n### Background', 'en-US')).toBe(
      'Here is the answer. Background.',
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
    ).toBe('Example. It works.');
  });

  it('removes punctuation and formatting symbols from Lingala speech', () => {
    expect(prepareTextForSpeech('Mbote, moninga. # Tokende!', 'ln-CD')).toBe(
      'Mbote moninga Tokende',
    );
  });

  it('passes speech-ready text to the native speech engine', async () => {
    await speechService.speak('### About a Boy\n- A short history', { language: 'en-US' });

    expect(Speech.speak).toHaveBeenCalledWith(
      'About a Boy. A short history.',
      expect.objectContaining({
        language: 'en-US',
        voice: 'enhanced-en',
        rate: 0.96,
        pitch: 1.02,
      }),
    );
  });

  it('does not replace unavailable Lingala speech with the English device voice', async () => {
    const onUnavailable = jest.fn();

    await speechService.speak('Mbote, moninga.', { language: 'ln-CD', onUnavailable });

    expect(Speech.speak).not.toHaveBeenCalled();
    expect(onUnavailable).toHaveBeenCalledTimes(1);
  });

  it('reports exhausted natural-speech credits and falls back to the device voice', async () => {
    const natural = naturalSpeechService as jest.Mocked<typeof naturalSpeechService>;
    const onNaturalError = jest.fn();
    natural.isAvailable.mockResolvedValueOnce(true);
    natural.prepare.mockResolvedValueOnce('usage_limit_exceeded');

    await speechService.speak('The answer remains available.', {
      language: 'en-US',
      onNaturalError,
    });
    await Promise.resolve();

    expect(onNaturalError).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'USAGE_LIMIT_EXCEEDED', retryable: false }),
    );
    expect(Speech.speak).toHaveBeenCalled();
  });

  it('breaks a speaker-tapped answer into sentences instead of synthesizing the whole answer', async () => {
    const natural = naturalSpeechService as jest.Mocked<typeof naturalSpeechService>;
    natural.isAvailable.mockResolvedValueOnce(true);
    natural.prepare.mockImplementation(async () => ({
      play: jest.fn(async () => 'done'),
      discard: jest.fn(),
    }));

    await speechService.speak('First sentence is ready. Second sentence follows.', {
      language: 'en-US',
    });

    expect(natural.prepare).toHaveBeenNthCalledWith(1, 'First sentence is ready.', 'en-US');
    expect(natural.prepare).toHaveBeenNthCalledWith(2, 'Second sentence follows.', 'en-US');
    expect(natural.prepare).not.toHaveBeenCalledWith(
      'First sentence is ready. Second sentence follows.',
      'en-US',
    );
  });

  it('queues a complete sentence before the streamed answer finishes', async () => {
    const session = await speechService.createStream({ language: 'en-US' }, 'streamed-answer');

    session.enqueue('The first sentence is ready. ');
    expect(Speech.speak).toHaveBeenCalledWith(
      'The first sentence is ready.',
      expect.objectContaining({ language: 'en-US', voice: 'enhanced-en' }),
    );

    session.enqueue('The final sentence arrives later');
    expect(Speech.speak).toHaveBeenCalledTimes(1);
    session.finish();
    expect(Speech.speak).toHaveBeenCalledTimes(2);
  });

  it('queues a sentence ending at the current stream boundary immediately', async () => {
    const session = await speechService.createStream({ language: 'en-US' }, 'boundary-answer');

    session.enqueue('The first sentence is ready.');

    expect(Speech.speak).toHaveBeenCalledWith(
      'The first sentence is ready.',
      expect.objectContaining({ language: 'en-US', voice: 'enhanced-en' }),
    );
    await session.cancel();
  });

  it('prepares the following natural-speech chunk while the first is playing', async () => {
    const natural = naturalSpeechService as jest.Mocked<typeof naturalSpeechService>;
    natural.isAvailable.mockResolvedValue(true);
    natural.prepare.mockImplementation(async () => ({
      play: jest.fn(async () => 'done'),
      discard: jest.fn(),
    }));
    const session = await speechService.createStream({ language: 'en-US' });

    session.enqueue('First sentence is ready. ');
    session.enqueue('Second sentence is already ready. ');

    expect(natural.prepare).toHaveBeenCalledTimes(2);
    await session.cancel();
  });
});
