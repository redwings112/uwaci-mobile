import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Keyboard, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { getLanguage } from '@/core/constants/languages';
import { usePipeNavigation } from '@/application/navigation/pipes/usePipeNavigation';
import { ensureAuthSession } from '@/core/auth/authSession';
import { mapApiError } from '@/core/errors/mapApiError';
import { speechService } from '@/core/speech/speechService';
import { useSubmitFeedbackMutation } from '@/features/feedback/api/feedbackApi';
import { FeedbackSheet } from '@/features/feedback/components/FeedbackSheet';
import type { FeedbackCategory } from '@/features/feedback/types';
import { LanguageSelector } from '@/features/language/components/LanguageSelector';
import { preferredLanguageChanged } from '@/features/language/state/languageSlice';
import { selectPreferredLanguage } from '@/features/language/state/selectors';
import { RecordingIndicator } from '@/features/voice/components/RecordingIndicator';
import { useVoiceQuery } from '@/features/voice/hooks/useVoiceQuery';
import { useVoiceRecorder } from '@/features/voice/hooks/useVoiceRecorder';
import { useSilenceAutoSubmit } from '@/features/voice/hooks/useSilenceAutoSubmit';
import { voiceReset, voiceStatusChanged } from '@/features/voice/state/voiceSlice';
import { AppHeader } from '@/shared/components/AppHeader/AppHeader';
import { AppIcon, type AppIconName } from '@/shared/components/AppIcon/AppIcon';
import { BottomTabBar } from '@/shared/components/BottomTabBar/BottomTabBar';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { StatusBanner } from '@/shared/components/StatusBanner/StatusBanner';
import { SurfaceCard } from '@/shared/components/SurfaceCard/SurfaceCard';
import { Typography } from '@/shared/components/Typography/Typography';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/tokens';

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

const suggestions: readonly { label: string; icon: AppIconName }[] = [
  { label: 'Business ideas with a small budget', icon: 'lightbulb' },
  { label: 'How should I set my prices?', icon: 'activity' },
  { label: 'Strategies to find customers', icon: 'profile' },
];

function isDraftConversation(value: string): boolean {
  return value === 'new' || value.startsWith('new-');
}

export function ConversationScreen({
  conversationId,
  initialText,
  startRecording = false,
  focusComposer = false,
}: ConversationScreenProps) {
  const router = useRouter();
  const { openMenu } = usePipeNavigation();
  const { t } = useTranslation();
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
  const mounted = useRef(true);
  const microphoneActionInProgress = useRef(false);
  const cancelRecorder = useRef(recorder.cancel);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const insets = useSafeAreaInsets();
  const keyboardVisible = keyboardHeight > 0;
  const isLocalConversation = isDraftConversation(conversationId);
  const serverConversationId =
    activeConversationId && !isDraftConversation(activeConversationId)
      ? activeConversationId
      : undefined;
  const remoteConversation = useGetConversationQuery(conversationId, { skip: isLocalConversation });
  const offline = network.initialized && network.isConnected === false;

  useEffect(() => {
    cancelRecorder.current = recorder.cancel;
  }, [recorder.cancel]);

  useEffect(() => {
    mounted.current = true;
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillChangeFrame' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, (event) =>
      setKeyboardHeight(Math.max(0, event.endCoordinates.height)),
    );
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => {
      mounted.current = false;
      show.remove();
      hide.remove();
    };
  }, [insets.bottom]);

  useEffect(() => {
    dispatch(conversationOpened(conversationId));
    return () => {
      void speechService.stop();
      void cancelRecorder.current();
      microphoneActionInProgress.current = false;
    };
  }, [conversationId, dispatch]);

  useEffect(() => {
    if (remoteConversation.data) dispatch(conversationLoaded(remoteConversation.data.messages));
  }, [dispatch, remoteConversation.data]);

  const acceptResult = useCallback(
    async (result: QueryResult, optimisticMessageId?: string) => {
      if (!mounted.current) return;
      dispatch(conversationOpened(result.conversationId));
      if (optimisticMessageId)
        dispatch(
          messageReconciled({ optimisticId: optimisticMessageId, message: result.userMessage }),
        );
      else dispatch(messageAdded(result.userMessage));
      dispatch(messageAdded(result.assistantMessage));
      dispatch(requestFinished());
      setRecoveryTranscript(null);
      setSpeechNotice(null);
      const responseLanguage = result.voiceAction?.language ?? language;
      if (result.voiceAction?.type === 'language_changed')
        dispatch(preferredLanguageChanged(result.voiceAction.language));
      if (voiceResponsesEnabled) {
        dispatch(voiceStatusChanged('speaking'));
        await speechService.speak(
          result.assistantMessage.content,
          {
            language: getLanguage(responseLanguage).speechLocale,
            onDone: () => dispatch(voiceStatusChanged('idle')),
            onStopped: () => dispatch(voiceStatusChanged('idle')),
            onUnavailable: () => {
              if (!mounted.current) return;
              setSpeechNotice(
                'No matching device voice is installed. The answer remains available as text.',
              );
              dispatch(voiceStatusChanged('idle'));
            },
            onError: () => {
              if (!mounted.current) return;
              setSpeechNotice(t('conversation.speechUnavailable'));
              dispatch(voiceStatusChanged('idle'));
            },
            onNaturalError: (error) => {
              if (mounted.current) setSpeechNotice(error.message);
            },
          },
          result.assistantMessage.id,
        );
      } else dispatch(voiceStatusChanged('idle'));
    },
    [dispatch, language, t, voiceResponsesEnabled],
  );

  const sendText = useCallback(
    async (text: string) => {
      if (offline) {
        dispatch(requestFailed(t('conversation.connectionError')));
        return;
      }
      try {
        await ensureAuthSession();
      } catch {
        router.push({
          pathname: '/(auth)/sign-in',
          params: { next: 'text', conversationId },
        });
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
    [
      acceptResult,
      conversationId,
      t,
      dispatch,
      language,
      offline,
      router,
      sendTextQuery,
      serverConversationId,
    ],
  );

  const handleMicrophone = async () => {
    if (microphoneActionInProgress.current) return;
    microphoneActionInProgress.current = true;
    try {
      if (recorder.status === 'speaking') {
        await speechService.stop();
        if (mounted.current) {
          dispatch(voiceStatusChanged('idle'));
          await recorder.start();
        }
        return;
      }
      if (recorder.status === 'idle' || recorder.status === 'error') {
        try {
          await ensureAuthSession();
        } catch {
          router.push({
            pathname: '/(auth)/sign-in',
            params: { next: 'voice', conversationId },
          });
          return;
        }
        if (!mounted.current) return;
        dispatch(requestErrorCleared());
        setRecoveryTranscript(null);
        await recorder.start();
        return;
      }
      if (recorder.status !== 'recording') return;

      const recording = await recorder.stop();
      if (!recording || !mounted.current) return;
      dispatch(requestStarted());
      try {
        const result = await voiceQuery.submit({
          uri: recording.uri,
          preferredLanguage: language,
          ...(serverConversationId ? { conversationId: serverConversationId } : {}),
        });
        if (!mounted.current) return;
        await acceptResult(result);
      } catch (error: unknown) {
        if (!mounted.current) return;
        const mapped = mapApiError(error);
        const transcript = mapped.details?.transcript;
        if (mapped.code === 'TRANSCRIPTION_LOW_CONFIDENCE' && typeof transcript === 'string')
          setRecoveryTranscript(transcript);
        dispatch(requestFailed(mapped.message));
      }
    } finally {
      microphoneActionInProgress.current = false;
    }
  };

  useSilenceAutoSubmit({
    recording: recorder.status === 'recording',
    audioLevel: recorder.audioLevel,
    durationMillis: recorder.durationMillis,
    onSilence: () => void handleMicrophone(),
  });

  const cancelVoiceRecording = async () => {
    if (microphoneActionInProgress.current) return;
    microphoneActionInProgress.current = true;
    try {
      await recorder.cancel();
      if (mounted.current) dispatch(requestErrorCleared());
    } finally {
      microphoneActionInProgress.current = false;
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
      params: { conversationId: 'new', focusComposer: 'true' },
    });
  };

  const openVoiceMode = () => {
    Keyboard.dismiss();

    router.replace({
      pathname: '/(app)',
      ...(serverConversationId ? { params: { conversationId: serverConversationId } } : {}),
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
  const microphoneDisabled =
    busy ||
    [
      'requesting_permission',
      'stopping',
      'processing_audio',
      'uploading',
      'response_received',
    ].includes(recorder.status);
  return (
    <SafeAreaView className="flex-1 bg-canvas dark:bg-[#111126]" edges={['top', 'bottom']}>
      <View className="flex-1" style={{ paddingBottom: keyboardHeight }}>
        <AppHeader onMenu={() => openMenu('pipe0')} />
        <View className="flex-row items-center justify-between px-3 pb-2">
          <Pressable
            className="min-h-9 items-center justify-center rounded-full border border-border bg-surface px-3"
            onPress={() => setShowLanguage((value) => !value)}
          >
            <View className="flex-row items-center gap-1.5">
              <AppIcon color={colors.brand} name="globe" size={18} />
              <Text className="text-xs font-semibold text-brand">
                {t('language.autoDetect', { language: getLanguage(language).nativeLabel })}
              </Text>
              <AppIcon color={colors.brand} name="chevronDown" size={16} />
            </View>
          </Pressable>
          <Pressable
            accessibilityLabel="Start new chat"
            className="min-h-9 items-center justify-center rounded-full border border-border bg-surface px-3"
            onPress={startNewConversation}
          >
            <View className="flex-row items-center gap-1.5">
              <AppIcon color={colors.brand} name="messageSquare" size={17} />
              <Text className="text-xs font-semibold text-brand">{t('conversation.newChat')}</Text>
            </View>
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
              title={t('conversation.offlineTitle')}
              message={t('conversation.offlineMessage')}
              variant="warning"
            />
          </View>
        ) : null}
        {auth.status === 'error' && auth.errorMessage ? (
          <View className="px-3 pb-2">
            <StatusBanner
              title={t('conversation.sessionTitle')}
              message={auth.errorMessage}
              variant="error"
            />
          </View>
        ) : null}
        {speechNotice ? (
          <View className="px-3 pb-2">
            <StatusBanner title={t('conversation.speechTitle')} message={speechNotice} />
          </View>
        ) : null}
        {request.errorMessage || recorder.errorMessage ? (
          <View className="px-3">
            <ErrorState
              message={
                request.errorMessage ?? recorder.errorMessage ?? t('conversation.voiceFailed')
              }
            />
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
                dispatch(voiceReset());
              }}
            >
              <Text className="text-xs font-semibold text-brand">
                {t('conversation.editTranscript')}
              </Text>
            </Pressable>
          </View>
        ) : null}
        {recorder.status === 'recording' ? (
          <SurfaceCard className="mx-3 mb-2 items-center p-2">
            <RecordingIndicator
              durationMillis={recorder.durationMillis}
              audioLevel={recorder.audioLevel}
            />
            <Text className="mt-1 text-xs text-muted">{t('conversation.stopHint')}</Text>
            <Pressable
              accessibilityLabel="Cancel voice recording"
              className="mt-1 min-h-9 items-center justify-center px-4"
              onPress={() => void cancelVoiceRecording()}
            >
              <Text className="text-xs font-semibold text-danger">Cancel</Text>
            </Pressable>
          </SurfaceCard>
        ) : null}
        {busy ? (
          <Typography className="px-3 py-1 text-center text-muted" accessibilityLiveRegion="polite">
            {t('voice.thinking')}
          </Typography>
        ) : null}

        {messages.some((message) => message.role === 'assistant') ? (
          <View className="pb-1">
            <View className="flex-row items-center justify-between px-3">
              <Text className="text-xs font-semibold text-muted">
                {t('conversation.suggestions')}
              </Text>
              <Pressable onPress={() => setFeedbackVisible(true)}>
                <View className="flex-row items-center gap-1">
                  <Text className="text-xs text-muted">{t('conversation.whyThese')}</Text>
                  <AppIcon color="#777789" name="info" size={16} />
                </View>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              contentContainerClassName="gap-2 px-3 py-2"
              showsHorizontalScrollIndicator={false}
            >
              {suggestions.map((suggestion) => (
                <Pressable
                  key={suggestion.label}
                  accessibilityRole="button"
                  accessibilityLabel={suggestion.label}
                  className="min-h-10 w-44 flex-row items-center gap-2 rounded-control border border-border bg-surface px-3 py-2"
                  disabled={busy}
                  onPress={() => void sendText(suggestion.label)}
                >
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-lavender">
                    <AppIcon color={colors.brand} name={suggestion.icon} size={13} />
                  </View>
                  <Text className="flex-1 text-xs text-ink dark:text-white">
                    {suggestion.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}
        <ConversationComposer
          key={composerPrefill.key}
          autoFocus={focusComposer}
          initialValue={composerPrefill.value}
          inputDisabled={busy || recorder.status === 'recording'}
          sending={busy}
          microphoneActive={recorder.status === 'recording'}
          microphoneDisabled={microphoneDisabled}
          onMicrophone={() => void handleMicrophone()}
          onPrivacy={() => router.push('/(app)/privacy')}
          onVoiceMode={openVoiceMode}
          onSend={sendText}
        />
        {keyboardVisible ? null : <BottomTabBar active="home" />}
        <FeedbackSheet
          visible={feedbackVisible}
          submitting={feedbackResult.isLoading}
          onClose={() => setFeedbackVisible(false)}
          onSubmit={(category) => void sendFeedback(category)}
        />
      </View>
    </SafeAreaView>
  );
}
