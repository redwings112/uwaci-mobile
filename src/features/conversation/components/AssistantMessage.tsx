import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, Share, Text, useColorScheme, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import * as Clipboard from 'expo-clipboard';

import { getLanguage, isUwaciLanguage } from '@/core/constants/languages';
import { logger } from '@/core/logging/logger';
import { isAnswerSaved, toggleSavedAnswer } from '@/features/library/storage/libraryStorage';
import { speechService } from '@/core/speech/speechService';
import { useSpeechPlayback } from '@/core/speech/useSpeechPlayback';
import { AppIcon } from '@/shared/components/AppIcon/AppIcon';
import { StatusBanner } from '@/shared/components/StatusBanner/StatusBanner';
import { SurfaceCard } from '@/shared/components/SurfaceCard/SurfaceCard';
import { UwaciLogo } from '@/shared/components/UwaciLogo/UwaciLogo';
import { useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/tokens';

import type { ConversationMessage } from '../types';
import { MarkdownMessage } from './MarkdownMessage';
import { MessageActionsSheet } from './MessageActionsSheet';

const bars = [5, 10, 15, 8, 13, 18, 7, 12, 17, 9, 14, 6, 16, 11, 8, 15, 7, 12];

const COLLAPSE_THRESHOLD = 480;

function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function AssistantMessage({
  message,
  conversationId,
  onExpand,
  tip,
}: {
  message: ConversationMessage;
  conversationId?: string;
  onExpand?: () => void;
  tip?: string;
}) {
  const { t } = useTranslation();
  const expandLabel = t('answer.expand');
  const language = useAppSelector((state) => state.language.preferredConversationLanguage);
  const userId = useAppSelector((state) => state.auth.userId);
  const [rate, setRate] = useState(1);
  const [savedState, setSavedState] = useState<{ key: string; value: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [actionsVisible, setActionsVisible] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const mounted = useRef(true);
  const playback = useSpeechPlayback();
  const activePlayback = playback.messageId === message.id && playback.status !== 'idle';
  const paused = activePlayback && playback.status === 'paused';
  const savedKey = userId ? `${userId}:${message.id}` : null;
  const saved = savedState?.key === savedKey && savedState.value;
  const scheme = useColorScheme();
  const cardColor = scheme === 'dark' ? '#1B1933' : '#FFFFFF';
  const sentDate = new Date(message.createdAt);
  const sentAt = Number.isNaN(sentDate.getTime())
    ? null
    : sentDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const collapsible = message.content.length > COLLAPSE_THRESHOLD;
  const collapsed = collapsible && !expanded;

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

  useEffect(() => {
    if (!activePlayback || paused) return;
    const timer = setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [activePlayback, paused]);

  const copy = async () => {
    await Clipboard.setStringAsync(message.content);
    if (!mounted.current) return;
    setCopied(true);
    setTimeout(() => {
      if (mounted.current) setCopied(false);
    }, 1500);
  };

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
    setElapsedSeconds(0);
    setSpeechNotice(null);
    const answerLanguage = isUwaciLanguage(message.language?.primary)
      ? message.language.primary
      : isUwaciLanguage(message.language?.preferred)
        ? message.language.preferred
        : language;
    await speechService.speak(
      message.content,
      {
        language: getLanguage(answerLanguage).speechLocale,
        rate,
        onError: () => setSpeechNotice(t('conversation.speechUnavailable')),
        onUnavailable: () => setSpeechNotice(t('conversation.speechUnavailable')),
        onNaturalError: (error) => setSpeechNotice(error.message),
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
        {sentAt ? <Text className="ml-2 text-xs text-muted">· {sentAt}</Text> : null}
        <View className="ml-auto flex-row gap-1">
          <Pressable
            accessibilityLabel={activePlayback ? t('a11y.stopSpoken') : t('a11y.readAloud')}
            className={`h-11 w-11 items-center justify-center rounded-full ${activePlayback ? 'bg-danger' : 'bg-lavender'}`}
            onPress={() => void speak()}
          >
            <AppIcon
              color={activePlayback ? '#FFFFFF' : colors.brand}
              name={activePlayback ? 'square' : 'volume'}
              size={22}
            />
          </Pressable>
          <Pressable
            accessibilityLabel={copied ? t('a11y.answerCopied') : t('a11y.copyAnswer')}
            className="h-11 w-11 items-center justify-center rounded-full"
            onPress={() => void copy()}
          >
            <AppIcon color={copied ? colors.brand : '#777789'} name={copied ? 'check' : 'copy'} />
          </Pressable>
          {onExpand ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('a11y.expandAnswer')}
              className="h-11 flex-row items-center gap-1 rounded-full border border-border px-3"
              onPress={onExpand}
            >
              <AppIcon color={colors.brand} name="expand" size={16} />
              <Text className="text-xs font-semibold text-brand">{expandLabel}</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityLabel={t('a11y.moreActions')}
            className="h-11 w-11 items-center justify-center rounded-full"
            onPress={() => setActionsVisible(true)}
          >
            <AppIcon color="#777789" name="more" size={24} />
          </Pressable>
        </View>
      </View>
      {speechNotice ? (
        <View className="mb-2">
          <StatusBanner title={t('conversation.speechTitle')} message={speechNotice} />
        </View>
      ) : null}
      <View className={collapsed ? 'max-h-64 overflow-hidden' : ''}>
        <MarkdownMessage content={message.content} />
        {collapsed ? (
          <View className="absolute bottom-0 left-0 right-0 h-12" pointerEvents="none">
            <Svg width="100%" height="100%">
              <Defs>
                <LinearGradient id="answerFade" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={cardColor} stopOpacity="0" />
                  <Stop offset="1" stopColor={cardColor} stopOpacity="1" />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#answerFade)" />
            </Svg>
          </View>
        ) : null}
      </View>
      {collapsible ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={collapsed ? t('answer.showFull') : t('answer.showLessLabel')}
          className="min-h-10 flex-row items-center gap-1"
          onPress={() => setExpanded((value) => !value)}
        >
          <Text className="text-sm font-semibold text-brand">
            {collapsed ? t('answer.showMore') : t('answer.showLess')}
          </Text>
          <AppIcon color={colors.brand} name={collapsed ? 'chevronDown' : 'chevronUp'} size={17} />
        </Pressable>
      ) : null}
      <View className="mt-2 flex-row items-center rounded-full border border-border bg-canvas px-2 py-1.5">
        <Pressable
          accessibilityLabel={
            paused
              ? t('a11y.resumeSpoken')
              : activePlayback
                ? Platform.OS === 'android'
                  ? t('a11y.stopSpoken')
                  : t('a11y.pauseSpoken')
                : t('a11y.playSpoken')
          }
          className="h-11 w-11 items-center justify-center rounded-full bg-lavender"
          onPress={() => void togglePlayback()}
        >
          <AppIcon
            color={colors.brand}
            name={
              paused || !activePlayback ? 'play' : Platform.OS === 'android' ? 'square' : 'pause'
            }
            size={24}
          />
        </Pressable>
        <Text className="ml-2 text-sm font-medium tabular-nums text-muted">
          {formatElapsed(activePlayback ? elapsedSeconds : 0)}
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
      {tip ? (
        <View className="mt-3 flex-row items-start rounded-card bg-lavender/70 p-3 dark:bg-white/5">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-surface dark:bg-white/10">
            <AppIcon color={colors.brand} name="lightbulb" size={18} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-semibold text-brand">{t('answer.tipTitle')}</Text>
            <Text className="mt-0.5 text-xs leading-5 text-muted">{tip}</Text>
          </View>
        </View>
      ) : null}
      <MessageActionsSheet
        saved={saved}
        saveDisabled={saving || !conversationId || !userId}
        visible={actionsVisible}
        onClose={() => setActionsVisible(false)}
        onSave={() => {
          setActionsVisible(false);
          void save();
        }}
        onShare={() => {
          setActionsVisible(false);
          void Share.share({ message: message.content });
        }}
      />
    </SurfaceCard>
  );
}
