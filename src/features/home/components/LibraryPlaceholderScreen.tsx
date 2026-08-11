import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  type HistoryEntry,
  listHistory,
  listSavedAnswers,
  type SavedAnswer,
  toggleSavedAnswer,
} from '@/features/library/storage/libraryStorage';
import { AppHeader } from '@/shared/components/AppHeader/AppHeader';
import { BottomTabBar } from '@/shared/components/BottomTabBar/BottomTabBar';
import { SurfaceCard } from '@/shared/components/SurfaceCard/SurfaceCard';
import { Typography } from '@/shared/components/Typography/Typography';

type LibraryTab = 'history' | 'saved' | 'discover';

const discoverPrompts = [
  {
    icon: '✦',
    title: 'Start a business with what you have',
    prompt: 'Give me practical business ideas I can start with a small budget in my city.',
  },
  {
    icon: '◎',
    title: 'Turn local knowledge into a plan',
    prompt: 'Help me turn a problem in my community into a simple step-by-step action plan.',
  },
  {
    icon: '◫',
    title: 'Learn something in my language',
    prompt: 'Explain a useful digital skill simply and give me a short practice exercise.',
  },
];

function timeLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function LibraryPlaceholderScreen({ tab }: { tab: LibraryTab }) {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [saved, setSaved] = useState<SavedAnswer[]>([]);
  const [loading, setLoading] = useState(tab !== 'discover');

  useEffect(() => {
    let active = true;
    if (tab === 'discover') return () => undefined;
    const load = tab === 'history' ? listHistory() : listSavedAnswers();
    void load.then((items) => {
      if (!active) return;
      if (tab === 'history') setHistory(items as HistoryEntry[]);
      else setSaved(items as SavedAnswer[]);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [tab]);

  const openConversation = (conversationId: string) => {
    router.push({
      pathname: '/(app)/conversation/[conversationId]',
      params: { conversationId },
    });
  };

  const startPrompt = (prompt: string) => {
    router.push({
      pathname: '/(app)/conversation/[conversationId]',
      params: { conversationId: 'new', initialText: prompt },
    });
  };

  const removeSaved = async (answer: SavedAnswer) => {
    await toggleSavedAnswer({
      conversationId: answer.conversationId,
      messageId: answer.messageId,
      content: answer.content,
      createdAt: answer.createdAt,
    });
    setSaved((items) => items.filter((item) => item.id !== answer.id));
  };

  const title = tab === 'history' ? 'History' : tab === 'saved' ? 'Saved' : 'Discover';
  return (
    <SafeAreaView className="flex-1 bg-canvas dark:bg-[#111126]" edges={['top', 'bottom']}>
      <AppHeader onMenu={() => router.push('/(app)/profile')} />
      <View className="px-4 pb-3 pt-1">
        <Typography variant="title">{title}</Typography>
        <Typography variant="caption" className="mt-1">
          {tab === 'history'
            ? 'Continue conversations saved securely on this device.'
            : tab === 'saved'
              ? 'Answers you bookmarked for quick access.'
              : 'Try a guided prompt, then keep the conversation going.'}
        </Typography>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="grow px-3 pb-5"
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Typography className="py-10 text-center text-muted">Loading…</Typography>
        ) : null}

        {!loading && tab === 'history' && history.length === 0 ? (
          <SurfaceCard className="items-center p-8">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-lavender">
              <Text className="text-3xl text-brand">◷</Text>
            </View>
            <Typography variant="title" className="mt-5 text-center">
              No conversations yet
            </Typography>
            <Typography className="mt-3 text-center text-muted">
              Your completed Uwaci conversations will appear here automatically.
            </Typography>
          </SurfaceCard>
        ) : null}

        {tab === 'history'
          ? history.map((item) => (
              <Pressable
                key={item.conversationId}
                onPress={() => openConversation(item.conversationId)}
              >
                <SurfaceCard className="mb-3 flex-row items-center p-4">
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-lavender">
                    <Text className="text-lg text-brand">◷</Text>
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-semibold text-ink" numberOfLines={1}>
                      {item.title || 'Uwaci conversation'}
                    </Text>
                    <Text className="mt-1 text-xs leading-4 text-muted" numberOfLines={2}>
                      {item.preview}
                    </Text>
                  </View>
                  <View className="ml-2 items-end">
                    <Text className="text-xs text-muted">{timeLabel(item.updatedAt)}</Text>
                    <Text className="mt-2 text-muted">›</Text>
                  </View>
                </SurfaceCard>
              </Pressable>
            ))
          : null}

        {!loading && tab === 'saved' && saved.length === 0 ? (
          <SurfaceCard className="items-center p-8">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-lavender">
              <Text className="text-3xl text-violet">☆</Text>
            </View>
            <Typography variant="title" className="mt-5 text-center">
              Nothing saved yet
            </Typography>
            <Typography className="mt-3 text-center text-muted">
              Tap the star on an Uwaci answer to keep it here.
            </Typography>
          </SurfaceCard>
        ) : null}

        {tab === 'saved'
          ? saved.map((answer) => (
              <SurfaceCard key={answer.id} className="mb-3 p-4">
                <Pressable onPress={() => openConversation(answer.conversationId)}>
                  <View className="flex-row items-center">
                    <Text className="text-xs font-semibold text-violet">★ Saved answer</Text>
                    <Text className="ml-auto text-xs text-muted">
                      {timeLabel(answer.createdAt)}
                    </Text>
                  </View>
                  <Text className="mt-3 text-sm leading-5 text-ink" numberOfLines={5}>
                    {answer.content}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  className="mt-3 min-h-9 justify-center self-end px-2"
                  onPress={() => void removeSaved(answer)}
                >
                  <Text className="text-xs font-semibold text-danger">Remove</Text>
                </Pressable>
              </SurfaceCard>
            ))
          : null}

        {tab === 'discover'
          ? discoverPrompts.map((item, index) => (
              <Pressable key={item.title} onPress={() => startPrompt(item.prompt)}>
                <SurfaceCard className="mb-3 flex-row items-center p-4">
                  <View
                    className={`h-12 w-12 items-center justify-center rounded-full ${index === 0 ? 'bg-lavender' : index === 1 ? 'bg-cyan/10' : 'bg-[#FFF5DA]'}`}
                  >
                    <Text
                      className={`text-xl ${index === 0 ? 'text-violet' : index === 1 ? 'text-cyan' : 'text-orange'}`}
                    >
                      {item.icon}
                    </Text>
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-semibold text-ink">{item.title}</Text>
                    <Text className="mt-1 text-xs leading-4 text-muted" numberOfLines={2}>
                      {item.prompt}
                    </Text>
                  </View>
                  <Text className="ml-2 text-brand">›</Text>
                </SurfaceCard>
              </Pressable>
            ))
          : null}
      </ScrollView>
      <BottomTabBar active={tab} />
    </SafeAreaView>
  );
}
