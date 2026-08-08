import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { VoiceState, VoiceStatus } from '../types';

const initialState: VoiceState = {
  status: 'idle',
  recordingUri: null,
  durationMillis: 0,
  errorMessage: null,
};

const voiceSlice = createSlice({
  name: 'voice',
  initialState,
  reducers: {
    voiceStatusChanged: (state, action: PayloadAction<VoiceStatus>) => {
      state.status = action.payload;
      if (action.payload !== 'error') state.errorMessage = null;
    },
    recordingUpdated: (
      state,
      action: PayloadAction<{ uri: string | null; durationMillis: number }>,
    ) => {
      state.recordingUri = action.payload.uri;
      state.durationMillis = action.payload.durationMillis;
    },
    voiceFailed: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.errorMessage = action.payload;
    },
    voiceReset: () => initialState,
  },
});

export const { recordingUpdated, voiceFailed, voiceReset, voiceStatusChanged } = voiceSlice.actions;
export const voiceReducer = voiceSlice.reducer;
