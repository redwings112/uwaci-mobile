import { fireEvent, render } from '@testing-library/react-native';

import { MessageActionsSheet } from '@/features/conversation/components/MessageActionsSheet';

describe('MessageActionsSheet', () => {
  it('offers share and save once the more menu is open', () => {
    const onShare = jest.fn();
    const onSave = jest.fn();
    const screen = render(
      <MessageActionsSheet
        saved={false}
        visible
        onClose={jest.fn()}
        onSave={onSave}
        onShare={onShare}
      />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Share answer' }));
    fireEvent.press(screen.getByRole('button', { name: 'Save answer' }));

    expect(onShare).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('flips the save label when the answer is already saved', () => {
    const screen = render(
      <MessageActionsSheet
        saved
        visible
        onClose={jest.fn()}
        onSave={jest.fn()}
        onShare={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Remove from saved' })).toBeTruthy();
  });
});
