import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { isUwaciLanguage } from '@/core/constants/languages';
import { secureStorage } from '@/core/storage/secureStorage';
import { STORAGE_KEYS } from '@/core/storage/storageKeys';
import {
  preferredLanguageChanged,
  uiLanguageChanged,
} from '@/features/language/state/languageSlice';
import {
  appearancePreferencesHydrated,
  type SettingsState,
  voiceResponsesChanged,
} from '@/features/settings/state/settingsSlice';
import { useAppDispatch } from '@/store/hooks';

export function PreferencesProvider({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let active = true;
    void Promise.all([
      secureStorage.get(STORAGE_KEYS.preferredLanguage),
      secureStorage.get(STORAGE_KEYS.uiLanguage),
      secureStorage.get(STORAGE_KEYS.voiceResponse),
      secureStorage.get(STORAGE_KEYS.appearance),
    ])
      .then(([preferredLanguage, uiLanguage, voiceResponse, appearance]) => {
        if (!active) return;
        if (isUwaciLanguage(preferredLanguage)) {
          dispatch(preferredLanguageChanged(preferredLanguage));
        }
        if (uiLanguage === 'en' || uiLanguage === 'fr') {
          dispatch(uiLanguageChanged(uiLanguage));
        }
        if (voiceResponse === 'true' || voiceResponse === 'false') {
          dispatch(voiceResponsesChanged(voiceResponse === 'true'));
        }
        if (appearance) {
          try {
            dispatch(
              appearancePreferencesHydrated(JSON.parse(appearance) as Partial<SettingsState>),
            );
          } catch {
            // Invalid appearance data is ignored and replaced the next time a preference changes.
          }
        }
      })
      .catch(() => {
        // Defaults remain usable if secure preference storage is unavailable.
      });
    return () => {
      active = false;
    };
  }, [dispatch]);

  return children;
}
