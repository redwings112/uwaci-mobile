import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

import { getLanguage } from '@/core/constants/languages';
import { speechService } from '@/core/speech/speechService';
import { useSpeechPlayback } from '@/core/speech/useSpeechPlayback';
import { AppIcon } from '@/shared/components/AppIcon/AppIcon';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { StatusBanner } from '@/shared/components/StatusBanner/StatusBanner';
import { useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/tokens';

import { selectConversationMessages } from '../state/selectors';
import { splitAnswerHeadline } from './answerHeadline';
import { MarkdownMessage } from './MarkdownMessage';

const bars = [5, 10, 15, 8, 13, 18, 7, 12, 17, 9, 14, 6, 16, 11, 8, 15, 7, 12, 10, 14];

function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes}:${(totalSeconds % 60).toString().padStart(2, '0')}`;
}

export function ExpandedAnswerScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const messages = useAppSelector(selectConversationMessages);
  const language = useAppSelector((state) => state.language.preferredConversationLanguage);
  const playback = useSpeechPlayback();
  const [copied, setCopied] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);

  const answer = [...messages].reverse().find((message) => message.role === 'assistant');
  const activePlayback = answer ? playback.messageId === answer.id : false;
  const paused = activePlayback && playback.status === 'paused';

  useEffect(() => {
    if (!activePlayback || paused) return;
    const timer = setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [activePlayback, paused]);

  if (!answer) {
    return (
      <SafeAreaView className="flex-1 bg-canvas dark:bg-[#111126]" edges={['top', 'bottom']}>
        <EmptyState
          title={t('conversation.noAnswerTitle')}
          message={t('conversation.noAnswerFull')}
        />
      </SafeAreaView>
    );
  }

  const { headline, body } = splitAnswerHeadline(answer.content);

  const speak = async () => {
    if (activePlayback) {
      await speechService.stop();
      return;
    }
    setElapsedSeconds(0);
    setSpeechNotice(null);
    await speechService.speak(
      answer.content,
      {
        language: getLanguage(language).speechLocale,
        onNaturalError: (error) => setSpeechNotice(error.message),
      },
      answer.id,
    );
  };

  const copy = async () => {
    await Clipboard.setStringAsync(answer.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas dark:bg-[#111126]" edges={['top', 'bottom']}>
      <View className="h-16 flex-row items-center justify-between px-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface dark:border-white/10 dark:bg-white/5"
          onPress={() => router.back()}
        >
          <AppIcon color={colors.brand} name="arrowLeft" size={22} />
        </Pressable>
        <View className="flex-row items-center gap-2" accessible accessibilityLabel="Uwaci">
          <Image
            className="h-9 w-9"
            resizeMode="contain"
            source={require('../../../../assets/logo.png')}
          />
          <View>
            <Text className="text-lg font-semibold text-ink dark:text-white">Uwaci</Text>
            <Text className="text-[10px] leading-3 text-muted">{t('common.tagline')}</Text>
          </View>
        </View>
        <View className="flex-row gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={activePlayback ? 'Stop spoken answer' : 'Read answer aloud'}
            className={`h-11 w-11 items-center justify-center rounded-full border border-border ${activePlayback ? 'bg-danger' : 'bg-surface dark:bg-white/5'}`}
            onPress={() => void speak()}
          >
            <AppIcon
              color={activePlayback ? '#FFFFFF' : colors.brand}
              name={activePlayback ? 'square' : 'volume'}
              size={21}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copied ? 'Answer copied' : 'Copy answer'}
            className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface dark:border-white/10 dark:bg-white/5"
            onPress={() => void copy()}
          >
            <AppIcon color={colors.brand} name={copied ? 'check' : 'copy'} size={21} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-6"
        showsVerticalScrollIndicator={false}
      >
        {speechNotice ? (
          <View className="mb-3">
            <StatusBanner title={t('conversation.speechTitle')} message={speechNotice} />
          </View>
        ) : null}
        <Text className="mb-2 text-sm font-semibold text-brand">Answer</Text>
        {headline ? (
          <Text className="mb-3 text-[26px] font-bold leading-9 text-ink dark:text-white">
            {headline}
          </Text>
        ) : null}
        <MarkdownMessage dashed content={body} />

        <View className="mt-4 flex-row items-start rounded-card bg-lavender/70 p-4 dark:bg-white/5">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-surface dark:bg-white/10">
            <AppIcon color={colors.brand} name="lightbulb" size={20} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-semibold text-brand">Conseil Uwaci</Text>
            <Text className="mt-1 text-xs leading-5 text-muted">
              Ask a follow-up any time — Uwaci keeps the rest of your conversation in mind.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="mx-4 mb-3 flex-row items-center rounded-full border border-border bg-surface px-2 py-1.5 dark:border-white/10 dark:bg-white/5">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={activePlayback ? 'Stop spoken answer' : 'Play spoken answer'}
          className="h-11 w-11 items-center justify-center rounded-full bg-brand"
          onPress={() => void speak()}
        >
          <AppIcon color="#FFFFFF" name={activePlayback ? 'square' : 'play'} size={22} />
        </Pressable>
        <Text className="ml-3 text-sm tabular-nums text-muted">
          {formatElapsed(activePlayback ? elapsedSeconds : 0)}
        </Text>
        <View className="mx-3 flex-1 flex-row items-center gap-0.5">
          {bars.map((height, index) => (
            <View
              key={`${height}-${index}`}
              className="w-0.5 rounded-full bg-brand/40"
              style={{ height }}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
