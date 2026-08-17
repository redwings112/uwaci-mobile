import { Image, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface UwaciLogoProps {
  dark?: boolean;
  compact?: boolean;
  tagline?: boolean;
}

export function UwaciLogo({ dark = false, compact = false, tagline = false }: UwaciLogoProps) {
  const { t } = useTranslation();
  return (
    <View
      className="flex-row items-center gap-2"
      accessible
      accessibilityLabel={tagline ? 'Uwaci. Knowledge for humanity.' : 'Uwaci'}
    >
      <Image
        className={compact ? 'h-9 w-9' : 'h-14 w-14'}
        resizeMode="contain"
        source={require('../../../../assets/logo.png')}
      />
      <View>
        <Text
          className={`${compact ? 'text-lg' : 'text-2xl'} font-semibold ${dark ? 'text-white' : 'text-ink dark:text-white'}`}
        >
          Uwaci
        </Text>
        {tagline ? (
          <Text className="text-[10px] leading-3 text-muted">{t('common.tagline')}</Text>
        ) : null}
      </View>
    </View>
  );
}
