import { combineReducers } from '@reduxjs/toolkit';

import { baseApi } from '@/core/api/baseApi';
import { networkReducer } from '@/core/network/networkSlice';
import { authReducer } from '@/features/authentication/state/authSlice';
import { conversationReducer } from '@/features/conversation/state/conversationSlice';
import { languageReducer } from '@/features/language/state/languageSlice';
import { settingsReducer } from '@/features/settings/state/settingsSlice';
import { voiceReducer } from '@/features/voice/state/voiceSlice';

export const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer,
  conversation: conversationReducer,
  language: languageReducer,
  network: networkReducer,
  settings: settingsReducer,
  voice: voiceReducer,
});
