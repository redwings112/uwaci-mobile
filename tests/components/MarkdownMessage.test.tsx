import { render } from '@testing-library/react-native';

import { MarkdownMessage } from '@/features/conversation/components/MarkdownMessage';

describe('MarkdownMessage', () => {
  it('renders headings and lists without exposing Markdown control characters', () => {
    const screen = render(
      <MarkdownMessage content={'## Practical plan\n\n- Start small\n- Measure results'} />,
    );

    expect(screen.getByText('Practical plan')).toBeTruthy();
    expect(screen.getByText('Start small')).toBeTruthy();
    expect(screen.getByText('Measure results')).toBeTruthy();
    expect(screen.queryByText('## Practical plan')).toBeNull();
  });
});
