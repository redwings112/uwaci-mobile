import { useEffect, useState } from 'react';
import { Pressable, Share, Text, View } from 'react-native';

import { getLanguage } from '@/core/constants/languages';
import { isAnswerSaved, toggleSavedAnswer } from '@/features/library/storage/libraryStorage';
import { speechService } from '@/core/speech/speechService';
import { SurfaceCard } from '@/shared/components/SurfaceCard/SurfaceCard';
import { UwaciLogo } from '@/shared/components/UwaciLogo/UwaciLogo';
import { Typography } from '@/shared/components/Typography/Typography';
import { useAppSelector } from '@/store/hooks';

import type { ConversationMessage } from '../types';

const colors = ['bg-violet', 'bg-brand', 'bg-cyan', 'bg-success', 'bg-orange'];
const bars = [5, 10, 15, 8, 13, 18, 7, 12, 17, 9, 14, 6, 16, 11, 8, 15, 7, 12];

function parseContent(content: string) {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const steps = lines
    .map((line) => line.match(/^(?:\d+[.)]|[-•])\s*(.+)$/)?.[1])
    .filter((line): line is string => Boolean(line));
  const intro = lines.filter((line) => !/^(?:\d+[.)]|[-•])\s+/.test(line)).join('\n');
  return { intro: intro || content, steps };
}

export function AssistantMessage({
  message,
  conversationId,
}: {
  message: ConversationMessage;
  conversationId?: string;
}) {
  const language = useAppSelector((state) => state.language.preferredConversationLanguage);
  const [expanded, setExpanded] = useState(false);
  const [rate, setRate] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [saved, setSaved] = useState(false);
  const parsed = parseContent(message.content);
  const visibleSteps = expanded ? parsed.steps : parsed.steps.slice(0, 3);

  useEffect(() => {
    let active = true;
    void isAnswerSaved(message.id).then((value) => {
      if (active) setSaved(value);
    });
    return () => {
      active = false;
    };
  }, [message.id]);

  const save = async () => {
    if (!conversationId) return;
    const next = await toggleSavedAnswer({
      conversationId,
      messageId: message.id,
      content: message.content,
      createdAt: message.createdAt,
    });
    setSaved(next);
  };

  const speak = async () => {
    if (speaking) {
      await speechService.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    await speechService.speak(message.content, {
      language: getLanguage(language).speechLocale,
      rate,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
      onUnavailable: () => setSpeaking(false),
    });
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
            accessibilityLabel="Read answer aloud"
            className="h-8 w-8 items-center justify-center rounded-full"
            onPress={() => void speak()}
          >
            <Text className="text-brand">{speaking ? '■' : '◖'}</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Share answer"
            className="h-8 w-8 items-center justify-center rounded-full"
            onPress={() => void Share.share({ message: message.content })}
          >
            <Text className="text-muted">□</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={saved ? 'Remove answer from saved' : 'Save answer'}
            className="h-8 w-8 items-center justify-center rounded-full"
            onPress={() => void save()}
          >
            <Text className={saved ? 'text-violet' : 'text-muted'}>{saved ? '★' : '☆'}</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="More answer actions"
            className="h-8 w-8 items-center justify-center rounded-full"
          >
            <Text className="text-muted">•••</Text>
          </Pressable>
        </View>
      </View>
      <Typography>{parsed.intro}</Typography>
      {visibleSteps.length ? (
        <View className="mt-3">
          {visibleSteps.map((step, index) => {
            const [title, ...rest] = step.split(':');
            return (
              <View key={`${step}-${index}`} className="min-h-12 flex-row">
                <View className="mr-3 items-center">
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full ${colors[index % colors.length]}`}
                  >
                    <Text className="text-xs font-semibold text-white">{index + 1}</Text>
                  </View>
                  {index < visibleSteps.length - 1 ? (
                    <View className="w-px flex-1 bg-border" />
                  ) : null}
                </View>
                <View className="flex-1 pb-3">
                  <Text className="text-sm font-semibold text-ink dark:text-white">{title}</Text>
                  {rest.length ? (
                    <Text className="mt-1 text-xs leading-4 text-muted dark:text-white/60">
                      {rest.join(':').trim()}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
          {parsed.steps.length > 3 ? (
            <Pressable
              className="min-h-9 justify-center"
              onPress={() => setExpanded((value) => !value)}
            >
              <Text className="text-xs font-medium text-brand">
                {expanded ? 'Show less  ⌃' : 'Show more  ⌄'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      <View className="mt-2 flex-row items-center rounded-full border border-border bg-canvas px-2 py-1.5">
        <Pressable
          accessibilityLabel="Play spoken answer"
          className="h-7 w-7 items-center justify-center rounded-full bg-lavender"
          onPress={() => void speak()}
        >
          <Text className="text-xs text-brand">{speaking ? '■' : '▶'}</Text>
        </Pressable>
        <Text className="ml-2 text-xs text-muted">Device voice</Text>
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
