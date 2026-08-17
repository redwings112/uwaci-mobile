import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { getPipeConfig } from '@/application/navigation/pipes/pipe.config';
import type { PipeId } from '@/application/navigation/pipes/pipe.types';
import { usePipeNavigation } from '@/application/navigation/pipes/usePipeNavigation';
import { AppHeader } from '@/shared/components/AppHeader/AppHeader';
import { AppIcon } from '@/shared/components/AppIcon/AppIcon';
import { BottomTabBar } from '@/shared/components/BottomTabBar/BottomTabBar';
import { SurfaceCard } from '@/shared/components/SurfaceCard/SurfaceCard';
import { Typography } from '@/shared/components/Typography/Typography';
import { colors } from '@/theme/tokens';

export function PipeContextScreen({ pipe }: { pipe: Exclude<PipeId, 'pipe0'> }) {
  const { t } = useTranslation();
  const { openMenu } = usePipeNavigation();
  const config = getPipeConfig(pipe);

  return (
    <SafeAreaView className="flex-1 bg-canvas dark:bg-[#111126]" edges={['top', 'bottom']}>
      <AppHeader onMenu={() => openMenu(pipe)} />
      <View className="flex-1 px-4 pt-4">
        <Typography variant="title">{t(config.labelKey)}</Typography>
        <Typography variant="caption" className="mt-1 leading-5">
          {t(config.descriptionKey)}
        </Typography>
        <SurfaceCard className="mt-6 items-center p-6">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-lavender">
            <AppIcon color={colors.brand} name="activity" size={31} />
          </View>
          <Text className="mt-4 text-center text-sm leading-6 text-muted">
            {t('pipes.contextReady')}
          </Text>
        </SurfaceCard>
      </View>
      <BottomTabBar active="context" pipe={pipe} />
    </SafeAreaView>
  );
}
