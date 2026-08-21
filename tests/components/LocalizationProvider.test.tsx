import { Text } from 'react-native';
import { act, render, screen } from '@testing-library/react-native';

import {
  BRAND_MOMENT_MS,
  LocalizationProvider,
} from '@/application/providers/LocalizationProvider';

jest.mock('@/application/bootstrap/bootstrapApp', () => ({
  bootstrapApp: jest.fn(() => Promise.resolve()),
}));

function renderProvider() {
  return render(
    <LocalizationProvider>
      <Text>Uwaci home</Text>
    </LocalizationProvider>,
  );
}

describe('LocalizationProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('holds the branded loading screen for the full brand moment', async () => {
    renderProvider();
    await act(async () => undefined);

    expect(screen.getByRole('progressbar', { name: 'Loading Uwaci' })).toBeTruthy();
    expect(screen.queryByText('Uwaci home')).toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(BRAND_MOMENT_MS - 1);
    });
    expect(screen.queryByText('Uwaci home')).toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(screen.getByText('Uwaci home')).toBeTruthy();
  });

  it('still starts the app when bootstrapping fails', async () => {
    const { bootstrapApp } = jest.requireMock('@/application/bootstrap/bootstrapApp') as {
      bootstrapApp: jest.Mock;
    };
    bootstrapApp.mockRejectedValueOnce(new Error('offline'));

    renderProvider();
    await act(async () => undefined);
    await act(async () => {
      jest.advanceTimersByTime(BRAND_MOMENT_MS);
    });

    expect(screen.getByText('Uwaci home')).toBeTruthy();
  });
});
