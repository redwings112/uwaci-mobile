import { fireEvent, render } from '@testing-library/react-native';

import { ErrorState } from '@/shared/components/ErrorState/ErrorState';

describe('ErrorState', () => {
  it('announces the problem and provides retry', () => {
    const retry = jest.fn();
    const screen = render(<ErrorState message="Check your connection." onRetry={retry} />);
    expect(screen.getByLabelText('Error: Check your connection.')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
