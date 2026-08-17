import { Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { UWACI_LANGUAGES, type UwaciLanguageCode } from '@/core/constants/languages';
import { Typography } from '@/shared/components/Typography/Typography';

interface LanguageSelectorProps {
  value: UwaciLanguageCode;
  onChange: (language: UwaciLanguageCode) => void;
  compact?: boolean;
}

export function LanguageSelector({ value, onChange, compact = false }: LanguageSelectorProps) {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2"
      accessibilityRole="radiogroup"
    >
      {UWACI_LANGUAGES.map((language) => {
        const selected = value === language.code;
        return (
          <Pressable
            key={language.code}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${language.nativeLabel}${language.isExperimental ? `, ${t('language.experimental')}` : ''}`}
            className={`min-h-12 justify-center rounded-full border px-4 ${selected ? 'border-brand bg-brand' : 'border-border bg-surface'}`}
            onPress={() => onChange(language.code)}
          >
            <View className="flex-row items-center gap-2">
              <Typography variant="label" className={selected ? 'text-white' : 'text-ink'}>
                {language.nativeLabel}
              </Typography>
              {!compact && language.isExperimental ? (
                <View className="h-2 w-2 rounded-full bg-accent" />
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
