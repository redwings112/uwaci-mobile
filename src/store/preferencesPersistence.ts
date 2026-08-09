import { createListenerMiddleware } from '@reduxjs/toolkit';

import { secureStorage } from '@/core/storage/secureStorage';
import { STORAGE_KEYS } from '@/core/storage/storageKeys';
import {
  preferredLanguageChanged,
  uiLanguageChanged,
} from '@/features/language/state/languageSlice';
import { voiceResponsesChanged } from '@/features/settings/state/settingsSlice';
import { i18n } from '@/localization';

export const preferencesListener = createListenerMiddleware();

preferencesListener.startListening({
  actionCreator: preferredLanguageChanged,
  effect: async (action) => {
    await secureStorage.set(STORAGE_KEYS.preferredLanguage, action.payload);
  },
});

preferencesListener.startListening({
  actionCreator: uiLanguageChanged,
  effect: async (action) => {
    await Promise.all([
      secureStorage.set(STORAGE_KEYS.uiLanguage, action.payload),
      i18n.changeLanguage(action.payload),
    ]);
  },
});

preferencesListener.startListening({
  actionCreator: voiceResponsesChanged,
  effect: async (action) => {
    await secureStorage.set(STORAGE_KEYS.voiceResponse, String(action.payload));
  },
});
