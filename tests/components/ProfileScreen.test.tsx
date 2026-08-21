import { fireEvent, render } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import { ProfileScreen } from '@/features/profile/components/ProfileScreen';
import { createAppStore } from '@/store';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

function renderScreen() {
  return render(
    <Provider store={createAppStore()}>
      <ProfileScreen />
    </Provider>,
  );
}

describe('ProfileScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('lists every settings destination', () => {
    const screen = renderScreen();

    for (const title of [
      'Profile',
      'Privacy & Security',
      'Usage',
      'Language',
      'Appearance',
      'Voice & Speech',
      'Notifications',
      'Help & Support',
      'About Uwaci',
    ]) {
      expect(screen.getByRole('button', { name: title })).toBeTruthy();
    }
  });

  it('routes the rows that have a destination', () => {
    const screen = renderScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Privacy & Security' }));
    expect(mockPush).toHaveBeenCalledWith('/(app)/privacy');

    fireEvent.press(screen.getByRole('button', { name: 'Usage' }));
    expect(mockPush).toHaveBeenCalledWith('/(app)/usage');

    fireEvent.press(screen.getByRole('button', { name: 'Appearance' }));
    expect(mockPush).toHaveBeenCalledWith('/(app)/appearance');

    fireEvent.press(screen.getByRole('button', { name: 'Voice & Speech' }));
    expect(mockPush).toHaveBeenCalledWith('/(app)/settings');
  });

  it('leaves rows without a destination inert', () => {
    const screen = renderScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Notifications' }));

    expect(mockPush).not.toHaveBeenCalled();
  });
});
