import { getLanguage, isUwaciLanguage, UWACI_LANGUAGES } from '@/core/constants/languages';

describe('language configuration', () => {
  it('marks only MVP languages as stable', () => {
    expect(
      UWACI_LANGUAGES.filter((language) => !language.isExperimental).map(
        (language) => language.code,
      ),
    ).toEqual(['en', 'fr']);
  });

  it('narrows supported codes and falls back safely', () => {
    expect(isUwaciLanguage('ln')).toBe(true);
    expect(isUwaciLanguage('de')).toBe(false);
    expect(getLanguage('sw').nativeLabel).toBe('Kiswahili');
  });
});
