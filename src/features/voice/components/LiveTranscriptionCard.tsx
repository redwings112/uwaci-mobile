import { useEffect, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppIcon } from '@/shared/components/AppIcon/AppIcon';
import { colors } from '@/theme/tokens';

interface LiveTranscriptionCardProps {
  transcript: string | null;
  listening: boolean;
  reduceMotion?: boolean;
  statusLabel: string;
  placeholder: string;
}

const DOT_COUNT = 4;

function PulsingDots({ reduceMotion }: { reduceMotion: boolean }) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    progress.stopAnimation();
    progress.setValue(0);
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.timing(progress, { toValue: DOT_COUNT, duration: 900, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [progress, reduceMotion]);

  return (
    <View className="flex-row items-center gap-1" accessibilityElementsHidden>
      {Array.from({ length: DOT_COUNT }, (_, index) => (
        <Animated.View
          key={index}
          className="h-1.5 w-1.5 rounded-full bg-brand"
          style={{
            opacity: reduceMotion
              ? 0.5
              : progress.interpolate({
                  inputRange: [index - 1, index, index + 1, DOT_COUNT],
                  outputRange: [0.25, 1, 0.25, 0.25],
                  extrapolate: 'clamp',
                }),
          }}
        />
      ))}
    </View>
  );
}

export function LiveTranscriptionCard({
  transcript,
  listening,
  reduceMotion = false,
  statusLabel,
  placeholder,
}: LiveTranscriptionCardProps) {
  const { t } = useTranslation();
  return (
    <View
      testID="live-transcription-card"
      accessibilityLabel={t('voice.liveTranscriptionA11y', {
        text: transcript ?? placeholder,
      })}
      className="rounded-card border border-border bg-surface px-4 py-4 dark:border-white/10 dark:bg-white/5"
    >
      <View className="flex-row items-center gap-2">
        <AppIcon color={colors.brand} name="audioLines" size={19} />
        <Text className="text-sm font-semibold text-brand">{t('voice.liveTranscription')}</Text>
      </View>
      <Text
        className={`mt-3 text-base leading-6 ${transcript ? 'text-ink dark:text-white' : 'text-muted'}`}
      >
        {transcript ?? placeholder}
      </Text>
      {listening ? (
        <View className="mt-4 flex-row items-center gap-2">
          <PulsingDots reduceMotion={reduceMotion} />
          <Text className="text-sm text-muted">{statusLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}
