process.env.EXPO_PUBLIC_APP_ENV = 'test';
process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.test.uwaci.invalid';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    remove: jest.fn(),
  })),
  setAudioModeAsync: jest.fn(async () => undefined),
  setIsAudioActiveAsync: jest.fn(async () => undefined),
}));

jest.mock('react-i18next', () => {
  const en = require('../src/localization/locales/en.json');
  const lookup = (key: string): string =>
    key
      .split('.')
      .reduce<unknown>((value, part) => (value as Record<string, unknown>)?.[part], en) as string;
  return {
    useTranslation: () => ({ t: (key: string) => lookup(key) ?? key }),
    initReactI18next: { type: '3rdParty', init: jest.fn() },
  };
});

jest.mock('@/localization', () => {
  const en = require('../src/localization/locales/en.json');
  const lookup = (key: string): string =>
    key
      .split('.')
      .reduce<unknown>((value, part) => (value as Record<string, unknown>)?.[part], en) as string;
  return {
    i18n: { isInitialized: true, t: (key: string) => lookup(key) ?? key },
    initializeLocalization: jest.fn(async () => undefined),
  };
});
