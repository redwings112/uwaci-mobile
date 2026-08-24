import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSubmitFeedbackMutation } from '@/features/feedback/api/feedbackApi';
import {
  AnswerFeedbackRow,
  VERDICT_CATEGORY,
  type AnswerVerdict,
} from '@/features/feedback/components/AnswerFeedbackRow';
import { AppHeader } from '@/shared/components/AppHeader/AppHeader';
import { AppIcon, type AppIconName } from '@/shared/components/AppIcon/AppIcon';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/tokens';

import { selectActiveConversationId, selectConversationMessages } from '../state/selectors';
import { AssistantMessage } from './AssistantMessage';
import { ConversationComposer } from './ConversationComposer';

const followUps: readonly { key: string; icon: AppIconName }[] = [
  { key: 'suggestions.business', icon: 'lightbulb' },
  { key: 'suggestions.pricing', icon: 'activity' },
  { key: 'suggestions.customers', icon: 'profile' },
];

export function AnswerScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const messages = useAppSelector(selectConversationMessages);
  const conversationId = useAppSelector(selectActiveConversationId);
  const [submitFeedback, feedbackResult] = useSubmitFeedbackMutation();
  const [verdict, setVerdict] = useState<AnswerVerdict | null>(null);

  const answer = [...messages].reverse().find((message) => message.role === 'assistant');

  const sendVerdict = async (next: AnswerVerdict) => {
    setVerdict(next);
    if (!conversationId) return;
    try {
      await submitFeedback({
        conversation_id: conversationId,
        ...(answer ? { message_id: answer.id } : {}),
        category: VERDICT_CATEGORY[next],
      }).unwrap();
    } catch {
      setVerdict(null);
    }
  };

  const askFollowUp = (question: string) => {
    router.push({
      pathname: '/(app)/conversation/[conversationId]',
      params: { conversationId: conversationId ?? 'new', initialText: question },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas dark:bg-[#111126]" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <AppHeader />
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-5"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center pb-3">
            <Text className="text-xl font-bold text-ink dark:text-white">{t('answer.title')}</Text>
            <View className="mt-1 h-1 w-12 rounded-full bg-brand" />
          </View>

          {answer ? (
            <AssistantMessage
              message={answer}
              onExpand={() => router.push('/(app)/answer/expanded')}
              tip={t('answer.tipBody')}
              {...(conversationId ? { conversationId } : {})}
            />
          ) : (
            <EmptyState
              title={t('conversation.noAnswerTitle')}
              message={t('conversation.noAnswerShort')}
            />
          )}

          {answer ? (
            <View className="mt-2">
              <AnswerFeedbackRow
                disabled={feedbackResult.isLoading}
                selected={verdict}
                onSelect={(next) => void sendVerdict(next)}
              />
            </View>
          ) : null}

          <Text className="mt-5 text-xs text-muted">{t('answer.moreQuestions')}</Text>
          <ScrollView
            horizontal
            contentContainerClassName="gap-2 py-2"
            showsHorizontalScrollIndicator={false}
          >
            {followUps.map((followUp) => (
              <Pressable
                key={followUp.key}
                accessibilityRole="button"
                accessibilityLabel={t(followUp.key)}
                className="min-h-10 w-44 flex-row items-center gap-2 rounded-control border border-border bg-surface px-3 py-2"
                onPress={() => askFollowUp(t(followUp.key))}
              >
                <View className="h-6 w-6 items-center justify-center rounded-full bg-lavender">
                  <AppIcon color={colors.brand} name={followUp.icon} size={13} />
                </View>
                <Text className="flex-1 text-xs text-ink dark:text-white">{t(followUp.key)}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </ScrollView>
        <ConversationComposer
          placeholder={t('answer.placeholder')}
          onSend={async (text) => askFollowUp(text)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
