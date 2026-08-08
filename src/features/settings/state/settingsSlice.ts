import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  voiceResponsesEnabled: boolean;
}

const initialState: SettingsState = { voiceResponsesEnabled: true };

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    voiceResponsesChanged: (state, action: PayloadAction<boolean>) => {
      state.voiceResponsesEnabled = action.payload;
    },
  },
});

export const { voiceResponsesChanged } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
