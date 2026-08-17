import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/shared/components/AppHeader/AppHeader';
import { AppIcon, type AppIconName } from '@/shared/components/AppIcon/AppIcon';
import { SurfaceCard } from '@/shared/components/SurfaceCard/SurfaceCard';
import { Typography } from '@/shared/components/Typography/Typography';
import { colors } from '@/theme/tokens';

const points: readonly { icon: AppIconName; key: string }[] = [
  { icon: 'mic', key: 'recordings' },
  { icon: 'lock', key: 'conversations' },
  { icon: 'shield', key: 'encrypted' },
  { icon: 'trash', key: 'history' },
];

export function PrivacyScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <SafeAreaView className="flex-1 bg-canvas dark:bg-[#111126]" edges={['top', 'bottom']}>
      <AppHeader back onBack={() => router.back()} />
      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8">
        <View className="items-center py-2">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-lavender dark:bg-white/10">
            <AppIcon color={colors.brand} name="shield" size={30} />
          </View>
          <Typography variant="title" className="mt-3 text-center">
            {t('privacy.title')}
          </Typography>
          <Typography variant="caption" className="mt-2 max-w-80 text-center leading-5">
            {t('privacy.detailsSubtitle')}
          </Typography>
        </View>
        {points.map((point) => (
          <SurfaceCard key={point.key} className="mt-3 flex-row p-4">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-lavender dark:bg-white/10">
              <AppIcon color={colors.brand} name={point.icon} size={20} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold text-ink dark:text-white">
                {t(`privacy.points.${point.key}.title`)}
              </Text>
              <Text className="mt-1 text-xs leading-5 text-muted">
                {t(`privacy.points.${point.key}.body`)}
              </Text>
            </View>
          </SurfaceCard>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
