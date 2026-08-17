import { fireEvent, render } from '@testing-library/react-native';

import { ConversationComposer } from '@/features/conversation/components/ConversationComposer';

describe('ConversationComposer', () => {
  it('offers the microphone while the field is empty', () => {
    const onMicrophone = jest.fn();
    const screen = render(<ConversationComposer onMicrophone={onMicrophone} onSend={jest.fn()} />);

    fireEvent.press(screen.getByRole('button', { name: 'Ask by voice' }));
    expect(onMicrophone).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Send question' })).toBeNull();
  });

  it('swaps to send once there is a question', () => {
    const onSend = jest.fn(async () => undefined);
    const screen = render(<ConversationComposer onSend={onSend} />);

    fireEvent.changeText(screen.getByLabelText('Your question'), 'How do I price my goods?');
    fireEvent.press(screen.getByRole('button', { name: 'Send question' }));

    expect(onSend).toHaveBeenCalledWith('How do I price my goods?');
  });

  it('becomes stop and send while a recording is running', () => {
    const onMicrophone = jest.fn();
    const screen = render(
      <ConversationComposer microphoneActive onMicrophone={onMicrophone} onSend={jest.fn()} />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Stop recording and send' }));
    expect(onMicrophone).toHaveBeenCalledTimes(1);
  });

  it('reaches the privacy detail from the shield', () => {
    const onPrivacy = jest.fn();
    const screen = render(<ConversationComposer onPrivacy={onPrivacy} onSend={jest.fn()} />);

    fireEvent.press(screen.getByRole('button', { name: 'Your data is private' }));
    expect(onPrivacy).toHaveBeenCalledTimes(1);
  });
});
