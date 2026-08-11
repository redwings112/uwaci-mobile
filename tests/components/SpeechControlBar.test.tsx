import { act, render } from '@testing-library/react-native';

import { speechService } from '@/core/speech/speechService';
import { SpeechControlBar } from '@/shared/components/SpeechControlBar/SpeechControlBar';

jest.mock('expo-speech', () => ({
  getAvailableVoicesAsync: jest.fn(async () => [{ language: 'en-US' }]),
  isSpeakingAsync: jest.fn(async () => false),
  pause: jest.fn(async () => undefined),
  resume: jest.fn(async () => undefined),
  speak: jest.fn(),
  stop: jest.fn(async () => undefined),
}));

describe('SpeechControlBar', () => {
  afterEach(async () => {
    await act(async () => speechService.stop());
  });

  it('provides a persistent stop action while an answer is speaking', async () => {
    const screen = render(<SpeechControlBar />);

    await act(async () => speechService.speak('An answer', { language: 'en-US' }, 'message-1'));

    expect(screen.getByText('Uwaci is speaking')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Stop spoken answer' })).toBeTruthy();
  });
});
