import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { playTemporaryAudio } from '@/core/audio/audioPlayer';
import { Typography } from '@/shared/components/Typography/Typography';
import { AppIcon } from '@/shared/components/AppIcon/AppIcon';
import { colors } from '@/theme/tokens';

import type { ConversationMessage } from '../types';
import { useTranslation } from 'react-i18next';

export function MessageBubble({
  message,
  audioUri,
}: {
  message: ConversationMessage;
  audioUri?: string;
}) {
  const { t } = useTranslation();
  const user = message.role === 'user';
  const [playing, setPlaying] = useState(false);
  const stopPlayback = useRef<(() => void) | null>(null);

  useEffect(
    () => () => {
      stopPlayback.current?.();
      stopPlayback.current = null;
    },
    [],
  );

  const togglePlayback = () => {
    if (stopPlayback.current) {
      stopPlayback.current();
      stopPlayback.current = null;
      setPlaying(false);
      return;
    }
    if (!audioUri) return;
    stopPlayback.current = playTemporaryAudio(audioUri);
    setPlaying(true);
  };

  return (
    <View
      className={`mb-3 max-w-[88%] rounded-control px-4 py-3 ${user ? 'self-end bg-lavender' : 'self-start border border-border bg-surface'}`}
      accessibilityLabel={`${user ? t('a11y.youSaid') : t('a11y.assistantAnswered')}: ${message.content}`}
    >
      {user ? (
        <Text className="mb-1 text-xs font-medium text-muted">
          You ·{' '}
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </Text>
      ) : null}
      <Typography className="text-ink">{message.content}</Typography>
      {message.transcription?.confidence != null ? (
        <Typography variant="caption" className="mt-2">
          Transcription confidence {Math.round(message.transcription.confidence * 100)}%
        </Typography>
      ) : null}
      {user && message.inputMethod === 'voice' ? (
        audioUri ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={playing ? t('a11y.stopYourRecording') : t('a11y.playYourRecording')}
            className="mt-2 h-10 w-10 items-center justify-center self-end rounded-full bg-brand"
            onPress={togglePlayback}
          >
            <AppIcon color="#FFFFFF" name={playing ? 'square' : 'play'} size={20} />
          </Pressable>
        ) : (
          <View className="mt-2 h-6 w-6 items-center justify-center self-end rounded-full bg-surface">
            <AppIcon color={colors.brand} name="mic" size={15} />
          </View>
        )
      ) : null}
    </View>
  );
}
