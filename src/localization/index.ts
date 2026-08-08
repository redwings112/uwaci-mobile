import * as Localization from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { isUwaciLanguage } from '@/core/constants/languages';

import { localizationResources } from './resources';

const i18n = createInstance();

export async function initializeLocalization(): Promise<void> {
  if (i18n.isInitialized) return;
  const deviceCode = Localization.getLocales()[0]?.languageCode;
  await i18n.use(initReactI18next).init({
    resources: localizationResources,
    lng: isUwaciLanguage(deviceCode) ? deviceCode : 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}

export { i18n };
