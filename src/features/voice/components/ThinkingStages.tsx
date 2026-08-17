import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Text, View } from 'react-native';

import { AppIcon } from '@/shared/components/AppIcon/AppIcon';
import { colors } from '@/theme/tokens';

export const THINKING_STAGE_KEYS = ['voice.stageTranscribing', 'voice.stageReasoning'] as const;
export const THINKING_STAGE_COUNT = THINKING_STAGE_KEYS.length;

interface ThinkingStagesProps {
  activeStage: number;
  elapsedByStage: readonly (number | null)[];
  reduceMotion?: boolean;
}

function formatStageTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

function ActiveDots({ reduceMotion }: { reduceMotion: boolean }) {
  const [progress] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.timing(progress, { toValue: 3, duration: 900, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [progress, reduceMotion]);
  return (
    <View className="flex-row items-center gap-1" accessibilityElementsHidden>
      {[0, 1, 2].map((index) => (
        <Animated.View
          key={index}
          className="h-1.5 w-1.5 rounded-full bg-brand"
          style={{
            opacity: reduceMotion
              ? 0.5
              : progress.interpolate({
                  inputRange: [index - 1, index, index + 1, 3],
                  outputRange: [0.25, 1, 0.25, 0.25],
                  extrapolate: 'clamp',
                }),
          }}
        />
      ))}
    </View>
  );
}

export function ThinkingStages({
  activeStage,
  elapsedByStage,
  reduceMotion = false,
}: ThinkingStagesProps) {
  const { t } = useTranslation();
  return (
    <View className="gap-4">
      {THINKING_STAGE_KEYS.map((key, index) => {
        const done = index < activeStage;
        const active = index === activeStage;
        const elapsed = elapsedByStage[index];
        return (
          <View key={key} className="flex-row items-center">
            <View
              className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                done ? 'border-brand bg-brand' : active ? 'border-brand' : 'border-border'
              }`}
            >
              {done ? <AppIcon color="#FFFFFF" name="check" size={14} strokeWidth={3} /> : null}
            </View>
            <Text
              className={`ml-3 flex-1 text-sm ${
                active
                  ? 'font-semibold text-ink dark:text-white'
                  : done
                    ? 'text-ink dark:text-white'
                    : 'text-muted'
              }`}
            >
              {t(key)}
            </Text>
            {active ? <ActiveDots reduceMotion={reduceMotion} /> : null}
            {elapsed != null ? (
              <Text className="ml-3 text-sm tabular-nums text-muted">
                {formatStageTime(elapsed)}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export function ThinkingAvatar() {
  return (
    <View className="items-center py-2" accessibilityElementsHidden>
      <View className="h-32 w-32 items-center justify-center rounded-full border-2 border-violet/50">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-lavender/60">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-surface">
            <AppIcon color={colors.brand} name="bot" size={34} />
          </View>
        </View>
      </View>
    </View>
  );
}
