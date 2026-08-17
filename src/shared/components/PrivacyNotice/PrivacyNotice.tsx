import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppIcon } from '@/shared/components/AppIcon/AppIcon';
import { colors } from '@/theme/tokens';

export function PrivacyNotice({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <Pressable
      testID="privacy-notice"
      accessibilityRole="button"
      accessibilityLabel="Your data is private. Uwaci protects your conversations."
      accessibilityHint="Opens the privacy detail"
      className="flex-row items-center rounded-card border border-border bg-surface px-4 py-3 dark:border-white/10 dark:bg-white/5"
      onPress={onPress}
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-lavender dark:bg-white/10">
        <AppIcon color={colors.brand} name="shield" size={20} />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-sm font-semibold text-ink dark:text-white">{t('privacy.title')}</Text>
        <Text className="mt-0.5 text-xs text-muted">{t('privacy.subtitle')}</Text>
      </View>
      <AppIcon color={colors.muted} name="chevronRight" size={20} />
    </Pressable>
  );
}
