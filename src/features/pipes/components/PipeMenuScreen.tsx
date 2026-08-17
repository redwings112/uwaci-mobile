import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { PIPE_IDS, getPipeConfig } from '@/application/navigation/pipes/pipe.config';
import type { PipeId } from '@/application/navigation/pipes/pipe.types';
import { usePipeNavigation } from '@/application/navigation/pipes/usePipeNavigation';
import { AppHeader } from '@/shared/components/AppHeader/AppHeader';
import { AppIcon } from '@/shared/components/AppIcon/AppIcon';
import { BottomTabBar } from '@/shared/components/BottomTabBar/BottomTabBar';
import { SurfaceCard } from '@/shared/components/SurfaceCard/SurfaceCard';
import { Typography } from '@/shared/components/Typography/Typography';
import { colors } from '@/theme/tokens';

export function PipeMenuScreen({ fromPipe }: { fromPipe: PipeId }) {
  const { t } = useTranslation();
  const { switchPipe, openAccount } = usePipeNavigation();

  return (
    <SafeAreaView className="flex-1 bg-canvas dark:bg-[#111126]" edges={['top', 'bottom']}>
      <AppHeader tagline />
      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-6">
        <Typography variant="title">{t('pipes.menu.title')}</Typography>
        <Typography variant="caption" className="mt-1 leading-5">
          {t('pipes.menu.subtitle')}
        </Typography>

        <View className="mt-5 gap-3">
          {PIPE_IDS.map((pipe) => {
            const config = getPipeConfig(pipe);
            const selected = pipe === fromPipe;
            return (
              <Pressable
                key={pipe}
                accessibilityRole="button"
                accessibilityLabel={t(config.labelKey)}
                accessibilityState={{ selected }}
                onPress={() => switchPipe(pipe)}
              >
                <SurfaceCard
                  className={`flex-row items-center border p-4 ${selected ? 'border-brand' : 'border-transparent'}`}
                >
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-lavender">
                    <AppIcon
                      color={colors.brand}
                      name={pipe === 'pipe0' ? 'home' : 'activity'}
                      size={23}
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-semibold text-ink dark:text-white">
                      {t(config.labelKey)}
                    </Text>
                    <Text className="mt-1 text-xs leading-4 text-muted">
                      {t(config.descriptionKey)}
                    </Text>
                  </View>
                  <AppIcon color={colors.muted} name="chevronRight" size={21} />
                </SurfaceCard>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          className="mt-5 min-h-12 flex-row items-center justify-center rounded-full border border-border bg-surface"
          onPress={() => openAccount(fromPipe)}
        >
          <AppIcon color={colors.brand} name="profile" size={20} />
          <Text className="ml-2 text-sm font-semibold text-brand">{t('pipes.menu.account')}</Text>
        </Pressable>
      </ScrollView>
      <BottomTabBar active="menu" pipe={fromPipe} />
    </SafeAreaView>
  );
}
