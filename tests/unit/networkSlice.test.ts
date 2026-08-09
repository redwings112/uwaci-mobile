import { networkReducer, networkStateChanged } from '@/core/network/networkSlice';

describe('network state', () => {
  it('marks connectivity initialized without treating unknown reachability as offline', () => {
    const state = networkReducer(
      undefined,
      networkStateChanged({ isConnected: true, isInternetReachable: null }),
    );
    expect(state).toEqual({
      initialized: true,
      isConnected: true,
      isInternetReachable: null,
    });
  });
});
