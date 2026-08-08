import en from './locales/en.json';
import fr from './locales/fr.json';
import ln from './locales/ln.json';
import sw from './locales/sw.json';

export const localizationResources = {
  en: { translation: en },
  fr: { translation: fr },
  ln: { translation: { ...en, ...ln } },
  sw: { translation: { ...en, ...sw } },
} as const;
