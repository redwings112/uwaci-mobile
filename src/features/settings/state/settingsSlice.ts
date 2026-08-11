import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'blue' | 'violet' | 'fuchsia' | 'cyan' | 'green' | 'orange' | 'coral';
export type TextSize = 'small' | 'medium' | 'large';
export type BubbleStyle = 'rounded' | 'soft' | 'compact';

export interface SettingsState {
  voiceResponsesEnabled: boolean;
  themeMode: ThemeMode;
  accentColor: AccentColor;
  textSize: TextSize;
  bubbleStyle: BubbleStyle;
  reduceMotion: boolean;
  increaseContrast: boolean;
}

const initialState: SettingsState = {
  voiceResponsesEnabled: true,
  themeMode: 'light',
  accentColor: 'blue',
  textSize: 'medium',
  bubbleStyle: 'rounded',
  reduceMotion: false,
  increaseContrast: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    voiceResponsesChanged: (state, action: PayloadAction<boolean>) => {
      state.voiceResponsesEnabled = action.payload;
    },
    appearancePreferencesHydrated: (state, action: PayloadAction<Partial<SettingsState>>) => ({
      ...state,
      ...action.payload,
    }),
    themeModeChanged: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
    },
    accentColorChanged: (state, action: PayloadAction<AccentColor>) => {
      state.accentColor = action.payload;
    },
    textSizeChanged: (state, action: PayloadAction<TextSize>) => {
      state.textSize = action.payload;
    },
    bubbleStyleChanged: (state, action: PayloadAction<BubbleStyle>) => {
      state.bubbleStyle = action.payload;
    },
    reduceMotionChanged: (state, action: PayloadAction<boolean>) => {
      state.reduceMotion = action.payload;
    },
    increaseContrastChanged: (state, action: PayloadAction<boolean>) => {
      state.increaseContrast = action.payload;
    },
  },
});

export const {
  accentColorChanged,
  appearancePreferencesHydrated,
  bubbleStyleChanged,
  increaseContrastChanged,
  reduceMotionChanged,
  textSizeChanged,
  themeModeChanged,
  voiceResponsesChanged,
} = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
