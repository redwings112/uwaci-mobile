import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { AppIcon, type AppIconName } from '@/shared/components/AppIcon/AppIcon';
import { colors } from '@/theme/tokens';

import type { VoiceStatus } from '../types';
import { ListeningRing } from './ListeningRing';

const ORB_SIZE = 160;
const RING_SIZE = 240;

interface VoiceOrbProps {
  status: VoiceStatus;
  audioLevel: number;
  disabled?: boolean;
  reduceMotion?: boolean;
  onPress: () => void;
}

function getOrbPresentation(
  status: VoiceStatus,
  labels: Record<'start' | 'stopRecording' | 'stopSpeaking' | 'thinking', string>,
): {
  icon: AppIconName;
  gradient: readonly [string, string];
  accessibilityLabel: string;
} {
  if (status === 'recording')
    return {
      icon: 'mic',
      gradient: [colors.brand, colors.violet],
      accessibilityLabel: labels.stopRecording,
    };
  if (status === 'speaking')
    return {
      icon: 'audioLines',
      gradient: [colors.violet, colors.fuchsia],
      accessibilityLabel: labels.stopSpeaking,
    };
  if (['stopping', 'processing_audio', 'uploading', 'preparing_speech'].includes(status))
    return {
      icon: 'sparkle',
      gradient: [colors.brand, colors.brandDark],
      accessibilityLabel: labels.thinking,
    };
  return {
    icon: 'mic',
    gradient: [colors.brand, colors.violet],
    accessibilityLabel: labels.start,
  };
}

export function VoiceOrb({
  status,
  audioLevel,
  disabled = false,
  reduceMotion = false,
  onPress,
}: VoiceOrbProps) {
  const { t } = useTranslation();
  const [motion] = useState(() => new Animated.Value(0));
  const recording = status === 'recording';
  const speaking = status === 'speaking';
  const thinking = ['stopping', 'processing_audio', 'uploading', 'preparing_speech'].includes(
    status,
  );
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

  const presentation = getOrbPresentation(status, {
    start: t('voice.startTalking'),
    stopRecording: t('voice.stopAndAnswer'),
    stopSpeaking: t('voice.stopSpeaking'),
    thinking: t('voice.thinking'),
  });

  const liveScale = recording ? 1 + Math.min(1, audioLevel) * 0.09 : 1;
  const pulseScale = motion.interpolate({
    inputRange: [0, 1],
    outputRange: [liveScale, liveScale + (speaking ? 0.09 : thinking ? 0.045 : 0.06)],
  });
  const ringScale = motion.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.22] });
  const ringOpacity = motion.interpolate({ inputRange: [0, 1], outputRange: [0.38, 0] });

  return (
    <View
      className="items-center justify-center"
      style={{ height: RING_SIZE, width: RING_SIZE }}
      accessible={false}
    >
      <View style={StyleSheet.absoluteFill}>
        <ListeningRing active={active} audioLevel={audioLevel} size={RING_SIZE} />
      </View>
      <Animated.View
        className={`absolute rounded-full ${speaking ? 'bg-violet/25' : 'bg-brand/15'}`}
        style={{
          height: ORB_SIZE,
          width: ORB_SIZE,
          opacity: active ? ringOpacity : 0.18,
          transform: [{ scale: ringScale }],
        }}
      />
      <Animated.View style={{ transform: [{ scale: reduceMotion ? liveScale : pulseScale }] }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={presentation.accessibilityLabel}
          accessibilityState={{ busy: thinking, disabled: disabled || thinking }}
          className={`items-center justify-center rounded-full shadow-lg ${disabled ? 'opacity-60' : ''}`}
          style={{ height: ORB_SIZE, width: ORB_SIZE }}
          disabled={disabled || thinking}
          onPress={onPress}
        >
          <View style={StyleSheet.absoluteFill}>
            <Svg width={ORB_SIZE} height={ORB_SIZE}>
              <Defs>
                <LinearGradient id="orbGradient" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={presentation.gradient[0]} />
                  <Stop offset="1" stopColor={presentation.gradient[1]} />
                </LinearGradient>
              </Defs>
              <Circle
                cx={ORB_SIZE / 2}
                cy={ORB_SIZE / 2}
                r={ORB_SIZE / 2}
                fill="url(#orbGradient)"
              />
            </Svg>
          </View>
          <AppIcon color="#FFFFFF" name={presentation.icon} size={58} strokeWidth={2.1} />
        </Pressable>
      </Animated.View>
    </View>
  );
}
