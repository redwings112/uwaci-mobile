import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getLanguage } from '@/core/constants/languages';
import { mapApiError } from '@/core/errors/mapApiError';
import { speechService } from '@/core/speech/speechService';
import { useSubmitFeedbackMutation } from '@/features/feedback/api/feedbackApi';
import { FeedbackSheet } from '@/features/feedback/components/FeedbackSheet';
import { recordHistory } from '@/features/library/storage/libraryStorage';
import type { FeedbackCategory } from '@/features/feedback/types';
import { LanguageSelector } from '@/features/language/components/LanguageSelector';
import { preferredLanguageChanged } from '@/features/language/state/languageSlice';
import { selectPreferredLanguage } from '@/features/language/state/selectors';
import { RecordingIndicator } from '@/features/voice/components/RecordingIndicator';
import { useVoiceQuery } from '@/features/voice/hooks/useVoiceQuery';
import { useVoiceRecorder } from '@/features/voice/hooks/useVoiceRecorder';
import { voiceReset, voiceStatusChanged } from '@/features/voice/state/voiceSlice';
import { AppHeader } from '@/shared/components/AppHeader/AppHeader';
import { BottomTabBar } from '@/shared/components/BottomTabBar/BottomTabBar';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { StatusBanner } from '@/shared/components/StatusBanner/StatusBanner';
import { SurfaceCard } from '@/shared/components/SurfaceCard/SurfaceCard';
import { Typography } from '@/shared/components/Typography/Typography';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { useGetConversationQuery, useSendTextQueryMutation } from '../api/conversationApi';
import {
  conversationLoaded,
  conversationOpened,
  conversationReset,
  messageAdded,
  messageReconciled,
  requestErrorCleared,
  requestFailed,
  requestFinished,
  requestStarted,
} from '../state/conversationSlice';
import {
  selectActiveConversationId,
  selectConversationMessages,
  selectConversationRequest,
} from '../state/selectors';
import type { QueryResult } from '../types';
import { ConversationComposer } from './ConversationComposer';
import { ConversationList } from './ConversationList';
import { TranscriptionPreview } from './TranscriptionPreview';

interface ConversationScreenProps {
  conversationId: string;
  initialText?: string;
  startRecording?: boolean;
  focusComposer?: boolean;
}

const suggestions = [
  'Business ideas with a small budget',
  'How should I set my prices?',
  'Strategies to find customers',
];

export function ConversationScreen({
  conversationId,
  initialText,
  startRecording = false,
  focusComposer = false,
}: ConversationScreenProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const messages = useAppSelector(selectConversationMessages);
  const activeConversationId = useAppSelector(selectActiveConversationId);
  const request = useAppSelector(selectConversationRequest);
  const network = useAppSelector((state) => state.network);
  const auth = useAppSelector((state) => state.auth);
  const language = useAppSelector(selectPreferredLanguage);
  const voiceResponsesEnabled = useAppSelector((state) => state.settings.voiceResponsesEnabled);
  const recorder = useVoiceRecorder();
  const voiceQuery = useVoiceQuery();
  const [sendTextQuery] = useSendTextQueryMutation();
  const [submitFeedback, feedbackResult] = useSubmitFeedbackMutation();
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [recoveryTranscript, setRecoveryTranscript] = useState<string | null>(null);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const [composerPrefill, setComposerPrefill] = useState<{ value: string; key: number }>({
    value: '',
    key: 0,
  });
  const initialActionHandled = useRef(false);
  const isLocalConversation = conversationId.startsWith('new-');
  const serverConversationId =
    activeConversationId && !activeConversationId.startsWith('new-')
      ? activeConversationId
      : undefined;
  const remoteConversation = useGetConversationQuery(conversationId, { skip: isLocalConversation });
  const offline = !network.isConnected || network.isInternetReachable === false;

  useEffect(() => {
    dispatch(conversationOpened(conversationId));
    return () => {
      void speechService.stop();
    };
  }, [conversationId, dispatch]);

  useEffect(() => {
    if (remoteConversation.data) dispatch(conversationLoaded(remoteConversation.data.messages));
  }, [dispatch, remoteConversation.data]);

  const acceptResult = useCallback(
    async (result: QueryResult, optimisticMessageId?: string) => {
      dispatch(conversationOpened(result.conversationId));
      if (optimisticMessageId)
        dispatch(
          messageReconciled({ optimisticId: optimisticMessageId, message: result.userMessage }),
        );
      else dispatch(messageAdded(result.userMessage));
      dispatch(messageAdded(result.assistantMessage));
      dispatch(requestFinished());
      void recordHistory({
        conversationId: result.conversationId,
        title: result.userMessage.content.slice(0, 48),
        preview: result.assistantMessage.content.slice(0, 120),
        updatedAt: result.assistantMessage.createdAt,
      });
      setRecoveryTranscript(null);
      setSpeechNotice(null);
      if (voiceResponsesEnabled) {
        dispatch(voiceStatusChanged('speaking'));
        await speechService.speak(result.assistantMessage.content, {
          language: getLanguage(language).speechLocale,
          onDone: () => dispatch(voiceStatusChanged('idle')),
          onStopped: () => dispatch(voiceStatusChanged('idle')),
          onUnavailable: () => {
            setSpeechNotice(
              'No matching device voice is installed. The answer remains available as text.',
            );
            dispatch(voiceStatusChanged('idle'));
          },
          onError: () => {
            setSpeechNotice('This answer could not be read aloud. You can still read it below.');
            dispatch(voiceStatusChanged('idle'));
          },
        });
      } else dispatch(voiceStatusChanged('idle'));
    },
    [dispatch, language, voiceResponsesEnabled],
  );

  const sendText = useCallback(
    async (text: string) => {
      if (offline) {
        dispatch(requestFailed('Check your connection and try again.'));
        return;
      }
      const localMessageId = `local-${Date.now()}`;
      dispatch(requestStarted());
      dispatch(
        messageAdded({
          id: localMessageId,
          role: 'user',
          content: text,
          createdAt: new Date().toISOString(),
          inputMethod: 'text',
        }),
      );
      try {
        const result = await sendTextQuery({
          text,
          preferred_language: language,
          ...(serverConversationId ? { conversation_id: serverConversationId } : {}),
        }).unwrap();
        await acceptResult(result, localMessageId);
      } catch (error: unknown) {
        dispatch(requestFailed(mapApiError(error).message));
      }
    },
    [acceptResult, dispatch, language, offline, sendTextQuery, serverConversationId],
  );

  const handleMicrophone = async () => {
    if (recorder.status === 'speaking') {
      await speechService.stop();
      dispatch(voiceStatusChanged('idle'));
      return;
    }
    if (recorder.status !== 'recording') {
      if (offline) {
        dispatch(requestFailed('You are offline. Type a draft or reconnect to send.'));
        return;
      }
      dispatch(requestErrorCleared());
      setRecoveryTranscript(null);
      await recorder.start();
      return;
    }
    const recording = await recorder.stop();
    if (!recording) return;
    dispatch(requestStarted());
    try {
      const result = await voiceQuery.submit({
        uri: recording.uri,
        preferredLanguage: language,
        ...(serverConversationId ? { conversationId: serverConversationId } : {}),
      });
      await acceptResult(result);
    } catch (error: unknown) {
      const mapped = mapApiError(error);
      const transcript = mapped.details?.transcript;
      if (mapped.code === 'TRANSCRIPTION_LOW_CONFIDENCE' && typeof transcript === 'string')
        setRecoveryTranscript(transcript);
      dispatch(requestFailed(mapped.message));
    }
  };

  useEffect(() => {
    if (initialActionHandled.current) return;
    initialActionHandled.current = true;
    if (initialText)
      queueMicrotask(() => {
        void sendText(initialText);
      });
    else if (startRecording) void recorder.start();
  }, [initialText, recorder, sendText, startRecording]);

  const startNewConversation = () => {
    dispatch(conversationReset());
    dispatch(voiceReset());
    router.replace({
      pathname: '/(app)/conversation/[conversationId]',
      params: { conversationId: `new-${Date.now()}`, focusComposer: 'true' },
    });
  };

  const sendFeedback = async (category: FeedbackCategory) => {
    const lastAssistant = [...messages].reverse().find((message) => message.role === 'assistant');
    try {
      await submitFeedback({
        conversation_id: serverConversationId ?? conversationId,
        ...(lastAssistant ? { message_id: lastAssistant.id } : {}),
        category,
      }).unwrap();
      setFeedbackVisible(false);
    } catch {
      /* Keep the sheet open so the user can retry. */
    }
  };

  const busy = request.status === 'sending' || voiceQuery.isLoading;
  return (
    <SafeAreaView className="flex-1 bg-canvas dark:bg-[#111126]" edges={['top']}>
      <AppHeader onMenu={() => router.push('/(app)/profile')} />
      <View className="flex-row items-center justify-between px-3 pb-2">
        <Pressable
          className="min-h-9 items-center justify-center rounded-full border border-border bg-surface px-3"
          onPress={() => setShowLanguage((value) => !value)}
        >
          <Text className="text-[9px] font-semibold text-brand">
            ◎ Auto-detect · {getLanguage(language).nativeLabel} ⌄
          </Text>
        </Pressable>
        <Pressable
          className="min-h-9 items-center justify-center rounded-full border border-border bg-surface px-3"
          onPress={startNewConversation}
        >
          <Text className="text-[9px] font-semibold text-brand">▢ New chat</Text>
        </Pressable>
      </View>
      {showLanguage ? (
        <View className="z-10 px-3 pb-2">
          <LanguageSelector
            value={language}
            onChange={(value) => {
              dispatch(preferredLanguageChanged(value));
              setShowLanguage(false);
            }}
          />
        </View>
      ) : null}

      <ConversationList
        conversationId={serverConversationId ?? conversationId}
        messages={messages}
      />

      {offline ? (
        <View className="px-3 pb-2">
          <StatusBanner
            title="You’re offline"
            message="Reconnect before sending a voice or text question."
            variant="warning"
          />
        </View>
      ) : null}
      {auth.status === 'error' && auth.errorMessage ? (
        <View className="px-3 pb-2">
          <StatusBanner
            title="Secure session unavailable"
            message={auth.errorMessage}
            variant="error"
          />
        </View>
      ) : null}
      {speechNotice ? (
        <View className="px-3 pb-2">
          <StatusBanner title="Spoken response unavailable" message={speechNotice} />
        </View>
      ) : null}
      {request.errorMessage ? (
        <View className="px-3">
          <ErrorState message={request.errorMessage} />
        </View>
      ) : null}
      {recoveryTranscript ? (
        <View className="px-3 pb-2">
          <TranscriptionPreview text={recoveryTranscript} />
          <Pressable
            className="mt-2 min-h-10 items-center justify-center rounded-full bg-lavender"
            onPress={() => {
              setComposerPrefill((current) => ({
                value: recoveryTranscript,
                key: current.key + 1,
              }));
              setRecoveryTranscript(null);
              dispatch(requestErrorCleared());
            }}
          >
            <Text className="text-xs font-semibold text-brand">Edit transcript instead</Text>
          </Pressable>
        </View>
      ) : null}
      {recorder.status === 'recording' ? (
        <SurfaceCard className="mx-3 mb-2 items-center p-2">
          <RecordingIndicator durationMillis={recorder.durationMillis} />
          <Text className="mt-1 text-[9px] text-muted">
            Tap the microphone again to stop and ask Uwaci.
          </Text>
        </SurfaceCard>
      ) : null}
      {busy ? (
        <Typography className="px-3 py-1 text-center text-muted" accessibilityLiveRegion="polite">
          Uwaci is thinking…
        </Typography>
      ) : null}

      {messages.some((message) => message.role === 'assistant') ? (
        <View className="pb-1">
          <View className="flex-row items-center justify-between px-3">
            <Text className="text-[9px] font-semibold text-muted">Suggestions</Text>
            <Pressable onPress={() => setFeedbackVisible(true)}>
              <Text className="text-[9px] text-muted">Why these? ⓘ</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            contentContainerClassName="gap-2 px-3 py-2"
            showsHorizontalScrollIndicator={false}
          >
            {suggestions.map((suggestion) => (
              <Pressable
                key={suggestion}
                className="min-h-10 max-w-40 justify-center rounded-control border border-border bg-surface px-3"
                disabled={busy}
                onPress={() => void sendText(suggestion)}
              >
                <Text className="text-[9px] text-ink">{suggestion}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}
      <ConversationComposer
        key={composerPrefill.key}
        autoFocus={focusComposer}
        disabled={busy || recorder.status === 'recording'}
        initialValue={composerPrefill.value}
        onMicrophone={() => void handleMicrophone()}
        onSend={sendText}
      />
      <BottomTabBar active="chat" />
      <FeedbackSheet
        visible={feedbackVisible}
        submitting={feedbackResult.isLoading}
        onClose={() => setFeedbackVisible(false)}
        onSubmit={(category) => void sendFeedback(category)}
      />
    </SafeAreaView>
  );
}
