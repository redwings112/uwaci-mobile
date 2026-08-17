import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConversationComposer } from '@/features/conversation/components/ConversationComposer';
import { AppHeader } from '@/shared/components/AppHeader/AppHeader';
import { AppIcon } from '@/shared/components/AppIcon/AppIcon';
import { BottomTabBar } from '@/shared/components/BottomTabBar/BottomTabBar';
import { SurfaceCard } from '@/shared/components/SurfaceCard/SurfaceCard';
import { Typography } from '@/shared/components/Typography/Typography';
import { useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/tokens';

import { ThinkingProgress } from './ThinkingProgress';
import { ThinkingAvatar, ThinkingStages } from './ThinkingStages';

interface ThinkingScreenProps {
  activeStage?: number;
  elapsedByStage?: readonly (number | null)[];
  onCancel?: () => void;
}

export function ThinkingScreen({
  activeStage = 0,
  elapsedByStage = [null, null],
  onCancel,
}: ThinkingScreenProps) {
  const reduceMotion = useAppSelector((state) => state.settings.reduceMotion);
  const { t } = useTranslation();
  return (
    <SafeAreaView className="flex-1 bg-canvas dark:bg-[#111126]" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <AppHeader tagline />
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-10"
          showsVerticalScrollIndicator={false}
        >
          <ThinkingProgress activeStep={activeStage >= 2 ? 2 : 1} />
          <View className="items-center pt-5">
            <Typography variant="title" accessibilityLiveRegion="polite">
              {t('voice.thinkingTitle')}
            </Typography>
            <Typography variant="caption" className="mt-1">
              {t('voice.thinkingSubtitle')}
            </Typography>
          </View>
          <SurfaceCard className="mt-4 p-4">
            <ThinkingAvatar />
            <View className="mt-3">
              <ThinkingStages
                activeStage={activeStage}
                elapsedByStage={elapsedByStage}
                reduceMotion={reduceMotion}
              />
            </View>
            <View className="mt-5 flex-row items-start rounded-card bg-lavender/70 p-3 dark:bg-white/5">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-surface dark:bg-white/10">
                <AppIcon color={colors.brand} name="lightbulb" size={19} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-ink dark:text-white">
                  {t('voice.didYouKnow')}
                </Text>
                <Text className="mt-0.5 text-xs leading-5 text-muted">
                  {t('voice.didYouKnowBody')}
                </Text>
              </View>
            </View>
          </SurfaceCard>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('voice.cancelQuestion')}
            className="mt-4 min-h-12 flex-row items-center justify-center gap-2 rounded-full border border-border bg-surface dark:border-white/10 dark:bg-white/5"
            onPress={onCancel}
          >
            <AppIcon color={colors.danger} name="x" size={19} />
            <Text className="text-sm font-semibold text-danger">{t('voice.cancelQuestion')}</Text>
          </Pressable>
        </ScrollView>
        <View className="flex-row items-center justify-center gap-1.5 py-2">
          <AppIcon color={colors.muted} name="lock" size={14} />
          <Text className="text-xs text-muted">{t('voice.privateAndSecure')}</Text>
        </View>
        <ConversationComposer inputDisabled microphoneDisabled onSend={async () => undefined} />
        <BottomTabBar active="home" showSpeechControls={false} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
