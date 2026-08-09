export type UwaciLanguageCode = 'en' | 'fr' | 'ln' | 'sw';
export type UiLanguageCode = Extract<UwaciLanguageCode, 'en' | 'fr'>;

export interface UwaciLanguage {
  code: UwaciLanguageCode;
  label: string;
  nativeLabel: string;
  isExperimental: boolean;
  speechLocale: string;
}

export const UWACI_LANGUAGES: readonly UwaciLanguage[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    isExperimental: false,
    speechLocale: 'en-US',
  },
  {
    code: 'fr',
    label: 'French',
    nativeLabel: 'Français',
    isExperimental: false,
    speechLocale: 'fr-FR',
  },
  {
    code: 'ln',
    label: 'Lingala',
    nativeLabel: 'Lingála',
    isExperimental: true,
    speechLocale: 'ln-CD',
  },
  {
    code: 'sw',
    label: 'Swahili',
    nativeLabel: 'Kiswahili',
    isExperimental: true,
    speechLocale: 'sw-KE',
  },
] as const;

export function isUwaciLanguage(value: string | null | undefined): value is UwaciLanguageCode {
  return UWACI_LANGUAGES.some((language) => language.code === value);
}

export function getLanguage(code: UwaciLanguageCode): UwaciLanguage {
  return UWACI_LANGUAGES.find((language) => language.code === code) ?? UWACI_LANGUAGES[0]!;
}
