import { useEffect, useState } from 'react';
import { Animated, Pressable, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/shared/components/AppIcon/AppIcon';

import type { VoiceStatus } from '../types';

interface VoiceOrbProps {
  status: VoiceStatus;
  audioLevel: number;
  disabled?: boolean;
  reduceMotion?: boolean;
  onPress: () => void;
}

function getOrbPresentation(status: VoiceStatus): {
  icon: AppIconName;
  colorClass: string;
  accessibilityLabel: string;
} {
  if (status === 'recording')
    return {
      icon: 'square',
      colorClass: 'bg-danger',
      accessibilityLabel: 'Stop recording and ask Uwaci',
    };
  if (status === 'speaking')
    return {
      icon: 'audioLines',
      colorClass: 'bg-violet',
      accessibilityLabel: 'Stop Uwaci speaking',
    };
  if (['stopping', 'processing_audio', 'uploading', 'transcribing', 'thinking'].includes(status))
    return {
      icon: 'sparkle',
      colorClass: 'bg-brand',
      accessibilityLabel: 'Uwaci is thinking',
    };
  return {
    icon: 'mic',
    colorClass: 'bg-brand',
    accessibilityLabel: 'Start talking to Uwaci',
  };
}

export function VoiceOrb({
  status,
  audioLevel,
  disabled = false,
  reduceMotion = false,
  onPress,
}: VoiceOrbProps) {
  const [motion] = useState(() => new Animated.Value(0));
  const recording = status === 'recording';
  const speaking = status === 'speaking';
  const thinking = [
    'stopping',
    'processing_audio',
    'uploading',
    'transcribing',
    'thinking',
  ].includes(status);
  const active = recording || speaking || thinking;

  useEffect(() => {
    motion.stopAnimation();
    motion.setValue(0);
    if (!active || reduceMotion) return;
    const duration = speaking ? 360 : recording ? 460 : 900;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(motion, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(motion, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [active, motion, recording, reduceMotion, speaking]);

  const presentation = getOrbPresentation(status);

  const liveScale = recording ? 1 + Math.min(1, audioLevel) * 0.09 : 1;
  const pulseScale = motion.interpolate({
    inputRange: [0, 1],
    outputRange: [liveScale, liveScale + (speaking ? 0.09 : thinking ? 0.045 : 0.06)],
  });
  const ringScale = motion.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.22] });
  const ringOpacity = motion.interpolate({ inputRange: [0, 1], outputRange: [0.38, 0] });

  return (
    <View className="h-60 w-60 items-center justify-center" accessible={false}>
      <Animated.View
        className={`absolute h-52 w-52 rounded-full ${speaking ? 'bg-violet/25' : 'bg-brand/15'}`}
        style={{ opacity: active ? ringOpacity : 0.18, transform: [{ scale: ringScale }] }}
      />
      <View className="h-52 w-52 items-center justify-center rounded-full border border-brand/20 bg-lavender/50 dark:bg-white/5">
        <Animated.View style={{ transform: [{ scale: reduceMotion ? liveScale : pulseScale }] }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={presentation.accessibilityLabel}
            accessibilityState={{ busy: thinking, disabled: disabled || thinking }}
            className={`h-40 w-40 items-center justify-center rounded-full shadow-lg ${presentation.colorClass} ${disabled ? 'opacity-60' : ''}`}
            disabled={disabled || thinking}
            onPress={onPress}
          >
            <AppIcon color="#FFFFFF" name={presentation.icon} size={58} strokeWidth={2.1} />
            {recording ? (
              <View className="absolute bottom-5 h-1.5 w-16 overflow-hidden rounded-full bg-white/25">
                <View
                  className="h-full rounded-full bg-white"
                  style={{ width: `${Math.max(12, audioLevel * 100)}%` }}
                />
              </View>
            ) : null}
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}
