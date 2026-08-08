import NetInfo from '@react-native-community/netinfo';

import type { NetworkState } from './networkTypes';

export async function getNetworkState(): Promise<NetworkState> {
  const state = await NetInfo.fetch();
  return {
    isConnected: state.isConnected === true,
    isInternetReachable: state.isInternetReachable,
  };
}

export function subscribeToNetworkState(listener: (state: NetworkState) => void): () => void {
  return NetInfo.addEventListener((state) =>
    listener({
      isConnected: state.isConnected === true,
      isInternetReachable: state.isInternetReachable,
    }),
  );
}
