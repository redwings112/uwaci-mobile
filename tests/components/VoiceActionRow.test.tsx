import { fireEvent, render } from '@testing-library/react-native';

import { VoiceActionRow } from '@/features/voice/components/VoiceActionRow';

describe('VoiceActionRow', () => {
  it('routes each action to its handler', () => {
    const onTypeInstead = jest.fn();
    const onCancel = jest.fn();
    const onAsk = jest.fn();
    const screen = render(
      <VoiceActionRow onAsk={onAsk} onCancel={onCancel} onTypeInstead={onTypeInstead} />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Open chat' }));
    fireEvent.press(screen.getByRole('button', { name: 'Cancel voice message' }));
    fireEvent.press(screen.getByRole('button', { name: 'Stop voice and get my answer' }));

    expect(onTypeInstead).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onAsk).toHaveBeenCalledTimes(1);
  });

  it('blocks the ask action while a request is in flight', () => {
    const onAsk = jest.fn();
    const screen = render(
      <VoiceActionRow askDisabled onAsk={onAsk} onCancel={jest.fn()} onTypeInstead={jest.fn()} />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Stop voice and get my answer' }));
    expect(onAsk).not.toHaveBeenCalled();
  });
});
