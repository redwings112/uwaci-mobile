import { fireEvent, render } from '@testing-library/react-native';

import { VoiceOrb } from '@/features/voice/components/VoiceOrb';

describe('VoiceOrb', () => {
  it('starts a voice turn from idle', () => {
    const onPress = jest.fn();
    const screen = render(<VoiceOrb audioLevel={0} reduceMotion status="idle" onPress={onPress} />);

    fireEvent.press(screen.getByRole('button', { name: 'Start talking to Uwaci' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes stop actions while recording and speaking', () => {
    const screen = render(
      <VoiceOrb audioLevel={0.8} reduceMotion status="recording" onPress={jest.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Stop recording and get my answer' })).toBeTruthy();

    screen.rerender(<VoiceOrb audioLevel={0} reduceMotion status="speaking" onPress={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Stop Uwaci speaking' })).toBeTruthy();
  });
});
