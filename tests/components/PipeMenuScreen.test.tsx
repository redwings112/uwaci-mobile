import { fireEvent, render, screen } from '@testing-library/react-native';

import { PipeMenuScreen } from '@/features/pipes/components/PipeMenuScreen';

const mockSwitchPipe = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@/application/navigation/pipes/usePipeNavigation', () => ({
  usePipeNavigation: () => ({
    switchPipe: mockSwitchPipe,
    navigate: mockNavigate,
    openAccount: jest.fn(),
    openMenu: jest.fn(),
    navigateToPipe: jest.fn(),
  }),
}));

describe('Pipe Menu', () => {
  beforeEach(() => jest.clearAllMocks());

  it('switches to the selected Pipe through the centralized action', () => {
    render(<PipeMenuScreen fromPipe="pipe0" />);
    fireEvent.press(screen.getByRole('button', { name: 'Pipe 1' }));
    expect(mockSwitchPipe).toHaveBeenCalledWith('pipe1');
  });
});
