import { render } from '@testing-library/react-native';

import { MessageBubble } from '@/features/conversation/components/MessageBubble';

describe('MessageBubble', () => {
  it('announces the speaker and preserves mixed-language content', () => {
    const screen = render(
      <MessageBubble
        message={{
          id: '1',
          role: 'user',
          content: 'Nalingi aide, s’il vous plaît',
          createdAt: 'now',
        }}
      />,
    );
    expect(screen.getByLabelText('You said: Nalingi aide, s’il vous plaît')).toBeTruthy();
  });

  it('offers replay only while the recording is still on the device', () => {
    const message = {
      id: '1',
      role: 'user' as const,
      content: 'Nalingi aide',
      createdAt: 'now',
      inputMethod: 'voice' as const,
    };

    const withoutAudio = render(<MessageBubble message={message} />);
    expect(withoutAudio.queryByRole('button', { name: 'Play your recording' })).toBeNull();

    const withAudio = render(<MessageBubble audioUri="file:///recording.m4a" message={message} />);
    expect(withAudio.getByRole('button', { name: 'Play your recording' })).toBeTruthy();
  });
});
