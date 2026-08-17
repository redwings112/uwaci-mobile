import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { VoiceState, VoiceStatus, VoiceThinkingStage } from '../types';

const initialState: VoiceState = {
  status: 'idle',
  recordingUri: null,
  durationMillis: 0,
  errorMessage: null,
  thinking: { activeStage: null, completed: {} },
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
    voiceThinkingStarted: (state, action: PayloadAction<VoiceThinkingStage>) => {
      state.thinking.activeStage = action.payload;
    },
    voiceThinkingCompleted: (
      state,
      action: PayloadAction<{ stage: VoiceThinkingStage; durationMs: number }>,
    ) => {
      state.thinking.completed[action.payload.stage] = action.payload.durationMs;
      if (state.thinking.activeStage === action.payload.stage) state.thinking.activeStage = null;
    },
    voiceThinkingReset: (state) => {
      state.thinking = { activeStage: null, completed: {} };
    },
    voiceReset: () => initialState,
  },
});

export const {
  recordingUpdated,
  voiceFailed,
  voiceReset,
  voiceStatusChanged,
  voiceThinkingCompleted,
  voiceThinkingReset,
  voiceThinkingStarted,
} = voiceSlice.actions;
export const voiceReducer = voiceSlice.reducer;
