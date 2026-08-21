import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import {
  listSavedAnswers,
  type SavedAnswer,
  toggleSavedAnswer,
} from '@/features/library/storage/libraryStorage';
import { mapApiError } from '@/core/errors/mapApiError';
import { useListConversationsQuery } from '@/features/conversation/api/conversationApi';
import { conversationToHistoryEntry } from '@/features/library/history';
import { AppHeader } from '@/shared/components/AppHeader/AppHeader';
import { AppIcon, type AppIconName } from '@/shared/components/AppIcon/AppIcon';
import { BottomTabBar } from '@/shared/components/BottomTabBar/BottomTabBar';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { SurfaceCard } from '@/shared/components/SurfaceCard/SurfaceCard';
import { Typography } from '@/shared/components/Typography/Typography';
import { useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/tokens';

type LibraryTab = 'history' | 'saved' | 'discover';

const discoverPrompts: { icon: AppIconName; id: string }[] = [
  { icon: 'rocket', id: 'business' },
  { icon: 'lightbulb', id: 'plan' },
  { icon: 'graduationCap', id: 'learn' },
];

function timeLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function LibraryPlaceholderScreen({ tab }: { tab: LibraryTab }) {
  const router = useRouter();
  const { t } = useTranslation();
  const auth = useAppSelector((state) => state.auth);
  const userId = auth.userId;
  const [saved, setSaved] = useState<SavedAnswer[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState<string | null>(null);
  const {
    data: conversations = [],
    error: conversationsError,
    isLoading: conversationsLoading,
    isUninitialized: conversationsUninitialized,
    refetch: refetchConversations,
  } = useListConversationsQuery(undefined, {
    skip: tab !== 'history' || !userId,
  });
  const history = conversations.map(conversationToHistoryEntry);

  useFocusEffect(
    useCallback(() => {
      if (tab !== 'history' || !userId || conversationsUninitialized) return;
      void refetchConversations();
    }, [conversationsUninitialized, refetchConversations, tab, userId]),
  );

  useFocusEffect(
    useCallback(() => {
      if (tab !== 'saved' || !userId) return;
      let active = true;
      setSavedLoading(true);
      setSavedError(null);
      void listSavedAnswers(userId)
        .then((items) => {
          if (active) setSaved(items);
        })
        .catch(() => {
          if (active) setSavedError(t('library.loadError'));
        })
        .finally(() => {
          if (active) setSavedLoading(false);
        });
      return () => {
        active = false;
      };
    }, [t, tab, userId]),
  );

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
    if (!userId) return;
    try {
      await toggleSavedAnswer(userId, {
        conversationId: answer.conversationId,
        messageId: answer.messageId,
        content: answer.content,
        createdAt: answer.createdAt,
      });
      setSaved((items) => items.filter((item) => item.id !== answer.id));
    } catch {
      setSavedError(t('library.removeError'));
    }
  };

  const historyError = conversationsError ? mapApiError(conversationsError).message : null;
  const loading =
    auth.status === 'unknown' ||
    (tab === 'history' && Boolean(userId) && conversationsLoading) ||
    (tab === 'saved' && Boolean(userId) && savedLoading);
  const error = tab === 'history' ? historyError : tab === 'saved' ? savedError : null;

  const title = t(`library.${tab}`);
  return (
    <SafeAreaView className="flex-1 bg-canvas dark:bg-[#111126]" edges={['top', 'bottom']}>
      <AppHeader />
      <View className="px-4 pb-3 pt-1">
        <Typography variant="title">{title}</Typography>
        <Typography variant="caption" className="mt-1">
          {tab === 'history'
            ? t('library.historySubtitle')
            : tab === 'saved'
              ? t('library.savedSubtitle')
              : t('library.discoverSubtitle')}
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

        {!loading && !userId && tab !== 'discover' ? (
          <SurfaceCard className="items-center p-8">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-lavender">
              <AppIcon color={colors.brand} name="profile" size={34} />
            </View>
            <Typography variant="title" className="mt-5 text-center">
              Sign in to see your {tab}
            </Typography>
            <Typography className="mt-3 text-center text-muted">
              Your conversations and saved answers are kept separate for each account.
            </Typography>
            <Pressable
              className="mt-5 min-h-11 items-center justify-center rounded-full bg-brand px-6"
              onPress={() => router.push('/(auth)/sign-in')}
            >
              <Text className="text-sm font-semibold text-white">{t('library.signIn')}</Text>
            </Pressable>
          </SurfaceCard>
        ) : null}

        {!loading && userId && error ? <ErrorState message={error} /> : null}

        {!loading && userId && !error && tab === 'history' && history.length === 0 ? (
          <SurfaceCard className="items-center p-8">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-lavender">
              <AppIcon color={colors.brand} name="history" size={34} />
            </View>
            <Typography variant="title" className="mt-5 text-center">
              No conversations yet
            </Typography>
            <Typography className="mt-3 text-center text-muted">
              Your completed Uwaci conversations will appear here automatically.
            </Typography>
          </SurfaceCard>
        ) : null}

        {userId && !error && tab === 'history'
          ? history.map((item) => (
              <Pressable
                key={item.conversationId}
                onPress={() => openConversation(item.conversationId)}
              >
                <SurfaceCard className="mb-3 flex-row items-center p-4">
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-lavender">
                    <AppIcon color={colors.brand} name="history" size={24} />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-semibold text-ink" numberOfLines={1}>
                      {item.title || t('library.untitled')}
                    </Text>
                    <Text className="mt-1 text-xs leading-4 text-muted" numberOfLines={2}>
                      {item.preview}
                    </Text>
                  </View>
                  <View className="ml-2 items-end">
                    <Text className="text-xs text-muted">{timeLabel(item.updatedAt)}</Text>
                    <View className="mt-2">
                      <AppIcon color="#777789" name="chevronRight" size={20} />
                    </View>
                  </View>
                </SurfaceCard>
              </Pressable>
            ))
          : null}

        {!loading && userId && !error && tab === 'saved' && saved.length === 0 ? (
          <SurfaceCard className="items-center p-8">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-lavender">
              <AppIcon color="#6F45EF" name="bookmark" size={34} />
            </View>
            <Typography variant="title" className="mt-5 text-center">
              Nothing saved yet
            </Typography>
            <Typography className="mt-3 text-center text-muted">
              Tap the star on an Uwaci answer to keep it here.
            </Typography>
          </SurfaceCard>
        ) : null}

        {userId && !error && tab === 'saved'
          ? saved.map((answer) => (
              <SurfaceCard key={answer.id} className="mb-3 p-4">
                <Pressable onPress={() => openConversation(answer.conversationId)}>
                  <View className="flex-row items-center">
                    <View className="flex-row items-center gap-1.5">
                      <AppIcon color="#6F45EF" name="star" size={18} />
                      <Text className="text-xs font-semibold text-violet">
                        {t('library.savedAnswer')}
                      </Text>
                    </View>
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
                  <View className="flex-row items-center gap-1.5">
                    <AppIcon color="#D6455D" name="trash" size={18} />
                    <Text className="text-xs font-semibold text-danger">Remove</Text>
                  </View>
                </Pressable>
              </SurfaceCard>
            ))
          : null}

        {tab === 'discover'
          ? discoverPrompts.map((item, index) => (
              <Pressable key={item.id} onPress={() => startPrompt(t(`discover.${item.id}Prompt`))}>
                <SurfaceCard className="mb-3 flex-row items-center p-4">
                  <View
                    className={`h-12 w-12 items-center justify-center rounded-full ${index === 0 ? 'bg-lavender' : index === 1 ? 'bg-cyan/10' : 'bg-[#FFF5DA]'}`}
                  >
                    <AppIcon
                      color={index === 0 ? '#6F45EF' : index === 1 ? '#10BFC5' : '#FFA51F'}
                      name={item.icon}
                      size={27}
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-semibold text-ink">
                      {t(`discover.${item.id}Title`)}
                    </Text>
                    <Text className="mt-1 text-xs leading-4 text-muted" numberOfLines={2}>
                      {t(`discover.${item.id}Prompt`)}
                    </Text>
                  </View>
                  <View className="ml-2">
                    <AppIcon color={colors.brand} name="chevronRight" size={22} />
                  </View>
                </SurfaceCard>
              </Pressable>
            ))
          : null}
      </ScrollView>
      <BottomTabBar active={tab} />
    </SafeAreaView>
  );
}
