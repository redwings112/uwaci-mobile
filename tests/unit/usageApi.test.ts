import { MY_USAGE_PATH, type MyUsage, usageApi } from '@/features/usage/api/usageApi';

describe('usage API contract', () => {
  it('owns the authenticated usage endpoint and exposes no provider economics', () => {
    const response: MyUsage = {
      plan: { code: 'free', display_name: 'Free' },
      period: { starts_at: null, ends_at: null },
      credits: {
        allocated: '100',
        used: '25',
        reserved: '5',
        remaining: '70',
        percentage_used: '25',
      },
      status: 'active',
    };

    expect(MY_USAGE_PATH).toBe('/usage/me');
    expect(usageApi.endpoints.getMyUsage).toBeDefined();
    expect(JSON.stringify(response)).not.toMatch(/provider|model|token|cost/i);
  });
});
