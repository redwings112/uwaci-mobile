import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Share, Text, View } from 'react-native';

import { getLanguage } from '@/core/constants/languages';
import { logger } from '@/core/logging/logger';
import { isAnswerSaved, toggleSavedAnswer } from '@/features/library/storage/libraryStorage';
import { speechService } from '@/core/speech/speechService';
import { useSpeechPlayback } from '@/core/speech/useSpeechPlayback';
import { AppIcon } from '@/shared/components/AppIcon/AppIcon';
import { SurfaceCard } from '@/shared/components/SurfaceCard/SurfaceCard';
import { UwaciLogo } from '@/shared/components/UwaciLogo/UwaciLogo';
import { useAppSelector } from '@/store/hooks';

import type { ConversationMessage } from '../types';
import { MarkdownMessage } from './MarkdownMessage';

const bars = [5, 10, 15, 8, 13, 18, 7, 12, 17, 9, 14, 6, 16, 11, 8, 15, 7, 12];

export function AssistantMessage({
  message,
  conversationId,
}: {
  message: ConversationMessage;
  conversationId?: string;
}) {
  const language = useAppSelector((state) => state.language.preferredConversationLanguage);
  const userId = useAppSelector((state) => state.auth.userId);
  const [rate, setRate] = useState(1);
  const [savedState, setSavedState] = useState<{ key: string; value: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const mounted = useRef(true);
  const playback = useSpeechPlayback();
  const activePlayback = playback.messageId === message.id && playback.status !== 'idle';
  const paused = activePlayback && playback.status === 'paused';
  const savedKey = userId ? `${userId}:${message.id}` : null;
  const saved = savedState?.key === savedKey && savedState.value;

  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  useEffect(() => {
    let active = true;
    if (!userId) return () => undefined;
    const key = `${userId}:${message.id}`;
    void isAnswerSaved(userId, message.id)
      .then((value) => {
        if (active) setSavedState({ key, value });
      })
      .catch((error: unknown) => {
        logger.warn('Saved answer state could not be loaded', {
          error: error instanceof Error ? error.name : 'unknown',
        });
      });
    return () => {
      active = false;
    };
  }, [message.id, userId]);

  const save = async () => {
    if (!conversationId || !userId || saving) return;
    setSaving(true);
    try {
      const next = await toggleSavedAnswer(userId, {
        conversationId,
        messageId: message.id,
        content: message.content,
        createdAt: message.createdAt,
      });
      if (mounted.current) setSavedState({ key: `${userId}:${message.id}`, value: next });
    } catch (error: unknown) {
      logger.warn('Saved answer could not be updated', {
        error: error instanceof Error ? error.name : 'unknown',
      });
    } finally {
      if (mounted.current) setSaving(false);
    }
  };

  const speak = async () => {
    if (activePlayback) {
      await speechService.stop();
      return;
    }
    await speechService.speak(
      message.content,
      {
        language: getLanguage(language).speechLocale,
        rate,
      },
      message.id,
    );
  };

  const togglePlayback = async () => {
    if (!activePlayback) {
      await speak();
      return;
    }
    if (Platform.OS === 'android') await speechService.stop();
    else await (paused ? speechService.resume() : speechService.pause());
  };

  return (
    <SurfaceCard className="mb-3 overflow-hidden p-3">
      <View className="mb-2 flex-row items-center">
        <UwaciLogo compact />
        <Text className="ml-2 text-xs text-muted">
          ·{' '}
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </Text>
        <View className="ml-auto flex-row gap-1">
          <Pressable
            accessibilityLabel={activePlayback ? 'Stop spoken answer' : 'Read answer aloud'}
            className={`h-11 w-11 items-center justify-center rounded-full ${activePlayback ? 'bg-danger' : 'bg-lavender'}`}
            onPress={() => void speak()}
          >
            <AppIcon
              color={activePlayback ? '#FFFFFF' : '#215C45'}
              name={activePlayback ? 'square' : 'volume'}
              size={22}
            />
          </Pressable>
          <Pressable
            accessibilityLabel="Share answer"
            className="h-11 w-11 items-center justify-center rounded-full"
            onPress={() => void Share.share({ message: message.content })}
          >
            <AppIcon color="#777789" name="share" size={23} />
          </Pressable>
          <Pressable
            accessibilityLabel={saved ? 'Remove answer from saved' : 'Save answer'}
            accessibilityState={{ busy: saving, disabled: saving }}
            className="h-11 w-11 items-center justify-center rounded-full"
            disabled={saving}
            onPress={() => void save()}
          >
            <AppIcon color={saved ? '#6F45EF' : '#777789'} name="star" size={24} />
          </Pressable>
          <Pressable
            accessibilityLabel="More answer actions"
            className="h-11 w-11 items-center justify-center rounded-full"
          >
            <AppIcon color="#777789" name="more" size={24} />
          </Pressable>
        </View>
      </View>
      <MarkdownMessage content={message.content} />
      <View className="mt-2 flex-row items-center rounded-full border border-border bg-canvas px-2 py-1.5">
        <Pressable
          accessibilityLabel={
            paused
              ? 'Resume spoken answer'
              : activePlayback
                ? Platform.OS === 'android'
                  ? 'Stop spoken answer'
                  : 'Pause spoken answer'
                : 'Play spoken answer'
          }
          className="h-11 w-11 items-center justify-center rounded-full bg-lavender"
          onPress={() => void togglePlayback()}
        >
          <AppIcon
            color="#215C45"
            name={
              paused || !activePlayback ? 'play' : Platform.OS === 'android' ? 'square' : 'pause'
            }
            size={24}
          />
        </Pressable>
        <Text className="ml-2 text-sm font-medium text-muted">
          {paused ? 'Paused' : activePlayback ? 'Speaking' : 'Device voice'}
        </Text>
        <View className="mx-2 flex-1 flex-row items-center gap-0.5">
          {bars.map((height, index) => (
            <View
              key={`${height}-${index}`}
              className="w-0.5 rounded-full bg-brand/40"
              style={{ height }}
            />
          ))}
        </View>
        <Pressable
          className="min-h-7 min-w-10 items-center justify-center rounded-full bg-surface"
          onPress={() => setRate((value) => (value === 1 ? 1.25 : value === 1.25 ? 0.8 : 1))}
        >
          <Text className="text-xs text-brand">{rate}x</Text>
        </Pressable>
      </View>
    </SurfaceCard>
  );
}
