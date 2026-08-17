import { fireEvent, render, screen } from '@testing-library/react-native';

import { BottomTabBar } from '@/shared/components/BottomTabBar/BottomTabBar';

const mockSwitchPipe = jest.fn();
const mockOpenMenu = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@/application/navigation/pipes/usePipeNavigation', () => ({
  usePipeNavigation: () => ({
    switchPipe: mockSwitchPipe,
    openMenu: mockOpenMenu,
    navigate: mockNavigate,
    openAccount: jest.fn(),
    navigateToPipe: jest.fn(),
  }),
}));

describe('contextual Pipe footer', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the active Pipe configuration and returns Home to Pipe 0', () => {
    render(<BottomTabBar active="context" pipe="pipe2" showSpeechControls={false} />);

    expect(screen.getByRole('tab', { name: 'Pipe 2' }).props.accessibilityState).toEqual({
      selected: true,
    });
    fireEvent.press(screen.getByRole('tab', { name: 'Home' }));
    expect(mockSwitchPipe).toHaveBeenCalledWith('pipe0');
  });

  it('opens Menu without losing the originating Pipe context', () => {
    render(<BottomTabBar active="context" pipe="pipe4" showSpeechControls={false} />);
    fireEvent.press(screen.getByRole('tab', { name: 'Menu' }));
    expect(mockOpenMenu).toHaveBeenCalledWith('pipe4');
  });
});
