import { fireEvent, render } from '@testing-library/react-native';

import { MicrophoneButton } from '@/features/voice/components/MicrophoneButton';

describe('MicrophoneButton', () => {
  it('exposes the current action to assistive technology', () => {
    const onPress = jest.fn();
    const screen = render(<MicrophoneButton status="idle" onPress={onPress} />);
    fireEvent.press(screen.getByRole('button', { name: 'Start voice recording' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('changes to a stop action while recording', () => {
    const screen = render(<MicrophoneButton status="recording" onPress={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Stop recording' })).toBeTruthy();
  });
});
