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
});
