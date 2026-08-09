import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { NetworkState } from './networkTypes';

interface AppNetworkState extends NetworkState {
  initialized: boolean;
}

const initialState: AppNetworkState = {
  initialized: false,
  isConnected: true,
  isInternetReachable: null,
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    networkStateChanged: (_state, action: PayloadAction<NetworkState>) => ({
      ...action.payload,
      initialized: true,
    }),
  },
});

export const { networkStateChanged } = networkSlice.actions;
export const networkReducer = networkSlice.reducer;
