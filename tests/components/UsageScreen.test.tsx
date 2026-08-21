import { render } from '@testing-library/react-native';

import { UsageScreen } from '@/features/usage/components/UsageScreen';
import { useGetMyUsageQuery } from '@/features/usage/api/usageApi';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

jest.mock('@/features/usage/api/usageApi', () => ({
  useGetMyUsageQuery: jest.fn(),
}));

const mockUsage = jest.mocked(useGetMyUsageQuery);

function usage(status: 'active' | 'approaching_limit' | 'exhausted' | 'configuration_required') {
  return {
    plan: { code: 'free', display_name: 'Free' },
    period: {
      starts_at: '2026-08-01T00:00:00Z',
      ends_at: '2026-09-01T00:00:00Z',
    },
    credits: {
      allocated: '100',
      used: status === 'exhausted' ? '100' : '75',
      reserved: '0',
      remaining: status === 'exhausted' ? '0' : '25',
      percentage_used: status === 'exhausted' ? '100' : '75',
    },
    status,
  } as const;
}

describe('UsageScreen', () => {
  it('announces the endpoint loading state', () => {
    mockUsage.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      error: undefined,
      refetch: jest.fn(),
    } as never);

    expect(render(<UsageScreen />).getByLabelText('Loading usage')).toBeTruthy();
  });

  it('renders authoritative Free plan balances with an accessible progress value', () => {
    mockUsage.mockReturnValue({
      data: usage('active'),
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: jest.fn(),
    } as never);

    const screen = render(<UsageScreen />);

    expect(screen.getByText('Free')).toBeTruthy();
    expect(screen.getByText('25')).toBeTruthy();
    expect(screen.getByLabelText('Monthly credit usage').props.accessibilityValue).toEqual({
      min: 0,
      max: 100,
      now: 75,
    });
    expect(screen.queryByText(/upgrade/i)).toBeNull();
  });

  it.each([
    ['approaching_limit', 'Credits are running low'],
    ['exhausted', 'Monthly credits used'],
    ['configuration_required', 'Free credits are being configured'],
  ] as const)('shows the %s state in text', (status, title) => {
    mockUsage.mockReturnValue({
      data: usage(status),
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: jest.fn(),
    } as never);

    expect(render(<UsageScreen />).getByText(title)).toBeTruthy();
  });

  it('does not present zero balances as real usage when policy configuration is missing', () => {
    mockUsage.mockReturnValue({
      data: {
        ...usage('configuration_required'),
        period: { starts_at: null, ends_at: null },
        credits: {
          allocated: '0',
          used: '0',
          reserved: '0',
          remaining: '0',
          percentage_used: '0',
        },
      },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: jest.fn(),
    } as never);

    const screen = render(<UsageScreen />);
    expect(screen.queryByText('0 of 0 used')).toBeNull();
    expect(screen.queryByLabelText('Monthly credit usage')).toBeNull();
  });
});
