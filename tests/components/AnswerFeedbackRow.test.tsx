import { fireEvent, render } from '@testing-library/react-native';

import {
  AnswerFeedbackRow,
  VERDICT_CATEGORY,
} from '@/features/feedback/components/AnswerFeedbackRow';

describe('AnswerFeedbackRow', () => {
  it('reports the verdict that was chosen', () => {
    const onSelect = jest.fn();
    const screen = render(<AnswerFeedbackRow onSelect={onSelect} />);

    fireEvent.press(screen.getByRole('button', { name: 'Yes. Very useful' }));
    expect(onSelect).toHaveBeenCalledWith('yes');

    fireEvent.press(screen.getByRole('button', { name: 'Somewhat. Partly useful' }));
    expect(onSelect).toHaveBeenCalledWith('somewhat');
  });

  it('stops accepting answers while one is being sent', () => {
    const onSelect = jest.fn();
    const screen = render(<AnswerFeedbackRow disabled onSelect={onSelect} />);

    fireEvent.press(screen.getByRole('button', { name: 'No. Not useful' }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('collapses somewhat and no onto the same category the API accepts', () => {
    expect(VERDICT_CATEGORY.yes).toBe('helpful');
    expect(VERDICT_CATEGORY.somewhat).toBe('not_helpful');
    expect(VERDICT_CATEGORY.no).toBe('not_helpful');
  });
});
