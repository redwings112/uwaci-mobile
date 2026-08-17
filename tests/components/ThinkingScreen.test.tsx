import { fireEvent, render } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import { ThinkingScreen } from '@/features/voice/components/ThinkingScreen';
import { createAppStore } from '@/store';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

function renderScreen(props: Parameters<typeof ThinkingScreen>[0] = {}) {
  return render(
    <Provider store={createAppStore()}>
      <ThinkingScreen {...props} />
    </Provider>,
  );
}

describe('ThinkingScreen', () => {
  it('shows the measured backend pipeline stages', () => {
    const screen = renderScreen();
    expect(screen.getByText('Uwaci is thinking…')).toBeTruthy();
    expect(screen.getByText('Understanding your recording')).toBeTruthy();
    expect(screen.getByText('Writing your answer')).toBeTruthy();
  });

  it('shows a time only for stages that the backend completed', () => {
    const screen = renderScreen({ activeStage: 1, elapsedByStage: [2, null] });
    expect(screen.getByText('00:02')).toBeTruthy();
    expect(screen.queryByText('00:00')).toBeNull();
  });

  it('lets the active streamed request be cancelled', () => {
    const onCancel = jest.fn();
    const screen = renderScreen({ onCancel });
    fireEvent.press(screen.getByRole('button', { name: 'Cancel this question' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
