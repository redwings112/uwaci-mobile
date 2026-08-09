import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { UiLanguageCode, UwaciLanguageCode } from '@/core/constants/languages';

interface LanguageState {
  preferredConversationLanguage: UwaciLanguageCode;
  uiLanguage: UiLanguageCode;
}

const initialState: LanguageState = { preferredConversationLanguage: 'en', uiLanguage: 'en' };

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    preferredLanguageChanged: (state, action: PayloadAction<UwaciLanguageCode>) => {
      state.preferredConversationLanguage = action.payload;
    },
    uiLanguageChanged: (state, action: PayloadAction<UiLanguageCode>) => {
      state.uiLanguage = action.payload;
    },
  },
});

export const { preferredLanguageChanged, uiLanguageChanged } = languageSlice.actions;
export const languageReducer = languageSlice.reducer;
