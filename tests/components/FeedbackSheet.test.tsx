import { fireEvent, render } from '@testing-library/react-native';

import { FeedbackSheet } from '@/features/feedback/components/FeedbackSheet';

describe('FeedbackSheet', () => {
  it('submits a typed category', () => {
    const onSubmit = jest.fn();
    const screen = render(<FeedbackSheet visible onClose={jest.fn()} onSubmit={onSubmit} />);
    fireEvent.press(screen.getByRole('button', { name: 'Transcription problem' }));
    expect(onSubmit).toHaveBeenCalledWith('transcription_problem');
  });
});
