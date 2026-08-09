import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { isUwaciLanguage } from '@/core/constants/languages';
import { secureStorage } from '@/core/storage/secureStorage';
import { STORAGE_KEYS } from '@/core/storage/storageKeys';
import {
  preferredLanguageChanged,
  uiLanguageChanged,
} from '@/features/language/state/languageSlice';
import { voiceResponsesChanged } from '@/features/settings/state/settingsSlice';
import { useAppDispatch } from '@/store/hooks';

export function PreferencesProvider({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let active = true;
    void Promise.all([
      secureStorage.get(STORAGE_KEYS.preferredLanguage),
      secureStorage.get(STORAGE_KEYS.uiLanguage),
      secureStorage.get(STORAGE_KEYS.voiceResponse),
    ])
      .then(([preferredLanguage, uiLanguage, voiceResponse]) => {
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
