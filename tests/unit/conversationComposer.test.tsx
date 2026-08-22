import { fireEvent, render } from '@testing-library/react-native';

import { ConversationComposer } from '@/features/conversation/components/ConversationComposer';

describe('ConversationComposer', () => {
  it('keeps the microphone actionable while text input is disabled during recording', () => {
    const onMicrophone = jest.fn();
    const screen = render(
      <ConversationComposer
        inputDisabled
        microphoneActive
        onMicrophone={onMicrophone}
        onSend={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByLabelText('Stop voice and send'));

    expect(onMicrophone).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Your question')).toHaveProp('editable', false);
  });
});
