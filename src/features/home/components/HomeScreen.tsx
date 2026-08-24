import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ensureAuthSession } from '@/core/auth/authSession';
import { getLanguage } from '@/core/constants/languages';
import { mapApiError } from '@/core/errors/mapApiError';
import { speechService, type SpeechStreamSession } from '@/core/speech/speechService';
import { useSpeechPlayback } from '@/core/speech/useSpeechPlayback';
import { useGetConversationQuery } from '@/features/conversation/api/conversationApi';
import {
  conversationLoaded,
  conversationOpened,
  conversationReset,
  messageAdded,
  requestErrorCleared,
  requestFailed,
  requestFinished,
  requestStarted,
} from '@/features/conversation/state/conversationSlice';
import {
  selectActiveConversationId,
  selectConversationMessages,
} from '@/features/conversation/state/selectors';
import { LanguageSelector } from '@/features/language/components/LanguageSelector';
import { preferredLanguageChanged } from '@/features/language/state/languageSlice';
import { selectPreferredLanguage, selectUiLanguage } from '@/features/language/state/selectors';
import { UsageExhaustedBanner } from '@/features/usage/components/UsageExhaustedBanner';
import { LiveTranscriptionCard } from '@/features/voice/components/LiveTranscriptionCard';
import { VoiceActionRow } from '@/features/voice/components/VoiceActionRow';
import { VoiceOrb } from '@/features/voice/components/VoiceOrb';
import { VoiceTranscriptPanel } from '@/features/voice/components/VoiceTranscriptPanel';
import { useVoiceQuery } from '@/features/voice/hooks/useVoiceQuery';
import { useVoiceRecorder } from '@/features/voice/hooks/useVoiceRecorder';
import { useSilenceAutoSubmit } from '@/features/voice/hooks/useSilenceAutoSubmit';
import {
  voiceFailed,
  voiceReset,
  voiceStatusChanged,
  voiceThinkingCompleted,
  voiceThinkingReset,
  voiceThinkingStarted,
} from '@/features/voice/state/voiceSlice';
import { HANDS_FREE_RESUME_DELAY_MS, shouldResumeListening } from '@/features/voice/handsFree';
import { registerVoiceTurnCanceller } from '@/features/voice/voiceTurnControl';
import { AppHeader } from '@/shared/components/AppHeader/AppHeader';
import { AppIcon } from '@/shared/components/AppIcon/AppIcon';
import { BottomTabBar } from '@/shared/components/BottomTabBar/BottomTabBar';
import { PrivacyNotice } from '@/shared/components/PrivacyNotice/PrivacyNotice';
import { SurfaceCard } from '@/shared/components/SurfaceCard/SurfaceCard';
import { Typography } from '@/shared/components/Typography/Typography';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/tokens';

interface HomeScreenProps {
  startRecording?: boolean;
  conversationId?: string;
}

const busyStatuses = [
  'requesting_permission',
  'stopping',
  'processing_audio',
  'uploading',
  'preparing_speech',
] as const;

export function HomeScreen({ startRecording = false, conversationId }: HomeScreenProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectPreferredLanguage);
  const uiLanguage = useAppSelector(selectUiLanguage);
  const messages = useAppSelector(selectConversationMessages);
  const activeConversationId = useAppSelector(selectActiveConversationId);
  const requestError = useAppSelector((state) => state.conversation.errorMessage);
  const reduceMotion = useAppSelector((state) => state.settings.reduceMotion);
  const activeStage = useAppSelector((state) => state.voice.thinking.activeStage);
  const recorder = useVoiceRecorder();
  const voiceQuery = useVoiceQuery();
  const playback = useSpeechPlayback();
  const [showLanguage, setShowLanguage] = useState(false);
  const [transcriptVisible, setTranscriptVisible] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<string | null>(null);
  const [lastProcessingMs, setLastProcessingMs] = useState<number | null>(null);
  const initialActionHandled = useRef(false);
  const mounted = useRef(true);
  const voiceActionInProgress = useRef(false);
  const turnCancelled = useRef(false);
  const completingVoiceTurn = useRef(false);
  const streamSession = useRef<SpeechStreamSession | null>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focused = useRef(true);
  const [conversationLoop, setConversationLoop] = useState(false);
  const requestedConversationId =
    conversationId && conversationId !== 'new' ? conversationId : null;
  const remoteConversation = useGetConversationQuery(requestedConversationId ?? '', {
    skip: !requestedConversationId,
  });
  const serverConversationId =
    activeConversationId && activeConversationId !== 'new' ? activeConversationId : undefined;
  const recording = recorder.status === 'recording';
  const speaking = recorder.status === 'speaking' || playback.status !== 'idle';
  const busy =
    busyStatuses.includes(recorder.status as (typeof busyStatuses)[number]) || voiceQuery.isLoading;

  useEffect(
    () => () => {
      mounted.current = false;
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      void speechService.stop();
    },
    [],
  );

  useEffect(() => {
    // Resolve device voices and natural-speech capability before the first turn.
    speechService.prewarm();
  }, []);

  useEffect(() => {
    if (!requestedConversationId) return;
    dispatch(conversationOpened(requestedConversationId));
  }, [dispatch, requestedConversationId]);

  useEffect(() => {
    if (remoteConversation.data) dispatch(conversationLoaded(remoteConversation.data.messages));
  }, [dispatch, remoteConversation.data]);

  const abortVoiceQuery = voiceQuery.abort;
  const cancelVoiceTurn = useCallback(() => {
    turnCancelled.current = true;
    if (resumeTimer.current) {
      clearTimeout(resumeTimer.current);
      resumeTimer.current = null;
    }
    setConversationLoop(false);
    abortVoiceQuery();
    void streamSession.current?.cancel();
    streamSession.current = null;
    dispatch(requestFinished());
    dispatch(requestErrorCleared());
    dispatch(voiceReset());
  }, [abortVoiceQuery, dispatch]);

  useEffect(() => {
    registerVoiceTurnCanceller(cancelVoiceTurn);
    return () => registerVoiceTurnCanceller(null);
  }, [cancelVoiceTurn]);

  const begin = useCallback(
    async (options: { resumed?: boolean } = {}) => {
      turnCancelled.current = false;
      setConversationLoop(true);
      if (!options.resumed) {
        try {
          await ensureAuthSession();
        } catch {
          router.push({ pathname: '/(auth)/sign-in', params: { next: 'voice' } });
          return;
        }
      }
      if (!mounted.current) return;
      speechService.prewarm();
      await speechService.stop();
      setLiveTranscript(null);
      setLastProcessingMs(null);
      dispatch(requestErrorCleared());
      await recorder.start();
    },
    [dispatch, recorder, router],
  );

  const finishSpeaking = useCallback(() => {
    dispatch(voiceStatusChanged('idle'));
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      return () => {
        focused.current = false;
      };
    }, []),
  );

  useEffect(() => {
    const resume = shouldResumeListening({
      listening: conversationLoop,
      status: recorder.status,
      focused: focused.current,
      busy,
      speaking,
      hasError: requestError != null || recorder.errorMessage != null,
      turnInFlight: completingVoiceTurn.current,
    });
    if (!resume || recording || resumeTimer.current) return;
    resumeTimer.current = setTimeout(() => {
      resumeTimer.current = null;
      if (mounted.current && focused.current) void begin({ resumed: true });
    }, HANDS_FREE_RESUME_DELAY_MS);
  }, [
    begin,
    busy,
    conversationLoop,
    playback.status,
    recorder.errorMessage,
    recorder.status,
    recording,
    requestError,
    speaking,
  ]);

  useEffect(() => {
    if (initialActionHandled.current || !startRecording) return;
    initialActionHandled.current = true;
    void begin();
  }, [begin, startRecording]);

  const completeVoiceTurn = async () => {
    if (completingVoiceTurn.current) return;
    completingVoiceTurn.current = true;
    const pendingSpeech: string[] = [];
    let firstDelta = true;
    let speechStarted = false;
    let speechSettled = false;
    try {
      const audio = await recorder.stop();
      if (!audio || !mounted.current) return;
      turnCancelled.current = false;
      dispatch(requestStarted());
      dispatch(voiceThinkingReset());
      const speechReady = speechService
        .createStream(
          {
            language: getLanguage(language).speechLocale,
            onStart: () => {
              speechStarted = true;
              dispatch(voiceStatusChanged('speaking'));
            },
            onDone: () => {
              speechSettled = true;
              streamSession.current = null;
              finishSpeaking();
            },
            onStopped: () => {
              speechSettled = true;
              streamSession.current = null;
              dispatch(voiceStatusChanged('idle'));
            },
            onError: () => {
              speechSettled = true;
              streamSession.current = null;
              setConversationLoop(false);
              dispatch(voiceFailed(t('voice.speechFailed')));
            },
          },
          `voice-stream-${Date.now()}`,
        )
        .then((session) => {
          streamSession.current = session;
          pendingSpeech.splice(0).forEach((chunk) => session.enqueue(chunk));
          return session;
        });
      const result = await voiceQuery.submit(
        {
          uri: audio.uri,
          preferredLanguage: language,
          ...(serverConversationId ? { conversationId: serverConversationId } : {}),
        },
        {
          onStage: (event) => {
            if (event.status === 'active') dispatch(voiceThinkingStarted(event.stage));
            else
              dispatch(
                voiceThinkingCompleted({ stage: event.stage, durationMs: event.durationMs ?? 0 }),
              );
          },
          onTranscript: (text) => setLiveTranscript(text),
          onDelta: (text) => {
            if (turnCancelled.current) return;
            if (firstDelta) {
              firstDelta = false;
            }
            if (streamSession.current) streamSession.current.enqueue(text);
            else pendingSpeech.push(text);
          },
        },
      );
      if (!mounted.current) return;
      dispatch(conversationOpened(result.conversationId));
      setLiveTranscript(result.userMessage.content);
      setLastProcessingMs(result.processing.reduce((total, stage) => total + stage.durationMs, 0));
      dispatch(messageAdded(result.userMessage));
      dispatch(messageAdded(result.assistantMessage));
      // The network request can finish before the first TTS chunk is ready.
      // Keep hands-free listening blocked during that gap without claiming that
      // audio is already playing. Otherwise the 120 ms resume timer starts a new
      // recording and begin() cancels the pending natural-speech request.
      if (!speechStarted && !speechSettled) dispatch(voiceStatusChanged('preparing_speech'));
      dispatch(requestFinished());
      if (result.voiceAction?.type === 'language_changed')
        dispatch(preferredLanguageChanged(result.voiceAction.language));
      const session = await speechReady;
      if (turnCancelled.current) await session.cancel();
      else {
        if (firstDelta) {
          session.enqueue(result.assistantMessage.content);
        }
        session.finish();
      }
    } catch (error: unknown) {
      if (!mounted.current) return;
      void streamSession.current?.cancel();
      streamSession.current = null;
      setConversationLoop(false);
      const mapped = mapApiError(error);
      dispatch(requestFailed(mapped.message));
      void speechService.speak(
        mapped.message,
        {
          language: getLanguage(uiLanguage).speechLocale,
          allowDeviceFallback: true,
        },
        `voice-error-${Date.now()}`,
      );
    } finally {
      completingVoiceTurn.current = false;
    }
  };

  const handleOrbPress = async () => {
    if (voiceActionInProgress.current) return;
    voiceActionInProgress.current = true;
    try {
      if (speaking && !recording) {
        await speechService.stop();
        if (mounted.current) {
          dispatch(voiceStatusChanged('idle'));
          await begin();
        }
      } else if (recording) await completeVoiceTurn();
      else if (!busy) await begin();
    } finally {
      voiceActionInProgress.current = false;
    }
  };

  useSilenceAutoSubmit({
    recording,
    audioLevel: recorder.audioLevel,
    durationMillis: recorder.durationMillis,
    onSilence: () => void completeVoiceTurn(),
  });

  const cancelRecording = async () => {
    if (!recording) return;
    setConversationLoop(false);
    await recorder.cancel();
    if (mounted.current) dispatch(requestErrorCleared());
  };

  const startNewVoiceConversation = async () => {
    setConversationLoop(true);
    await speechService.stop();
    await recorder.cancel();
    streamSession.current = null;
    dispatch(conversationReset());
    dispatch(voiceReset());
    setTranscriptVisible(false);
    setLiveTranscript(null);
    setLastProcessingMs(null);
    router.replace('/(app)');
  };

  const switchToType = async () => {
    setConversationLoop(false);
    await speechService.stop();
    await recorder.cancel();

    router.replace({
      pathname: '/(app)/conversation/[conversationId]',
      params: { conversationId: serverConversationId ?? 'new', focusComposer: 'true' },
    });
  };

  const awaitingMicrophone =
    conversationLoop &&
    !voiceQuery.isLoading &&
    !speaking &&
    !requestError &&
    !recorder.errorMessage &&
    (recorder.status === 'idle' ||
      recorder.status === 'ready' ||
      recorder.status === 'requesting_permission');
  const listening = recording || awaitingMicrophone;

  const statusTitle = listening
    ? t('voice.listeningTitle')
    : speaking
      ? t('voice.speaking')
      : busy
        ? activeStage === 'transcribing'
          ? t('voice.stageTranscribing')
          : activeStage === 'reasoning'
            ? t('voice.stageReasoning')
            : t('voice.preparingAnswer')
        : messages.length
          ? t('voice.readyNext')
          : t('voice.talkNaturally');
  const statusCaption = listening
    ? t('voice.listeningCaption')
    : speaking
      ? t('voice.speakingCaption')
      : busy
        ? activeStage === 'transcribing'
          ? t('voice.transcribingCaption')
          : activeStage === 'reasoning'
            ? t('voice.reasoningCaption')
            : t('voice.thinkingCaption')
        : t('voice.idleCaption');

  return (
    <SafeAreaView className="flex-1 bg-canvas dark:bg-[#111126]" edges={['top', 'bottom']}>
      <AppHeader
        actionIcon="messageSquare"
        actionLabel={t('voice.newConversation')}
        onAction={() => void startNewVoiceConversation()}
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('voice.chooseLanguage')}
            className="min-h-11 justify-center rounded-full border border-border bg-surface px-4"
            onPress={() => setShowLanguage((value) => !value)}
          >
            <View className="flex-row items-center gap-2">
              <AppIcon color={colors.brand} name="globe" size={19} />
              <Text className="text-sm font-semibold text-brand">
                {t('language.autoDetectShort')}
              </Text>
              <Text className="text-sm text-muted">·</Text>
              <Text className="text-sm font-semibold text-ink dark:text-white">
                {getLanguage(language).nativeLabel}
              </Text>
              <AppIcon color={colors.muted} name="chevronDown" size={17} />
            </View>
          </Pressable>
        </View>
        {showLanguage ? (
          <View className="z-10 mt-2">
            <LanguageSelector
              value={language}
              onChange={(value) => {
                dispatch(preferredLanguageChanged(value));
                setShowLanguage(false);
              }}
            />
          </View>
        ) : null}

        <View className="items-center pt-2">
          <VoiceOrb
            audioLevel={recorder.audioLevel}
            disabled={voiceQuery.isLoading && !speaking}
            reduceMotion={reduceMotion}
            status={listening && !recording ? 'recording' : recorder.status}
            onPress={() => void handleOrbPress()}
          />
          <Typography variant="title" className="mt-1 max-w-80 text-center">
            {statusTitle}
          </Typography>
          <Typography variant="caption" className="mt-2 max-w-72 text-center leading-5">
            {statusCaption}
          </Typography>
        </View>

        {requestError || recorder.errorMessage ? (
          <SurfaceCard className="mt-3 border border-danger/30 bg-danger/5 p-3">
            <Text className="text-center text-sm text-danger">
              {requestError ?? recorder.errorMessage}
            </Text>
          </SurfaceCard>
        ) : null}

        <UsageExhaustedBanner />

        {listening || liveTranscript ? (
          <View className="mt-4">
            <LiveTranscriptionCard
              listening={listening}
              placeholder={t('voice.transcriptPlaceholder')}
              reduceMotion={reduceMotion}
              statusLabel={
                recording
                  ? t('voice.listeningSeconds', {
                      seconds: Math.floor(recorder.durationMillis / 1000),
                    })
                  : lastProcessingMs != null
                    ? t('voice.readyInSeconds', {
                        seconds: Math.max(0.1, lastProcessingMs / 1000).toFixed(1),
                      })
                    : ''
              }
              transcript={liveTranscript}
            />
          </View>
        ) : null}

        {recording ? (
          <View className="mt-5">
            <VoiceActionRow
              askDisabled={voiceQuery.isLoading}
              onAsk={() => void handleOrbPress()}
              onCancel={() => void cancelRecording()}
              onTypeInstead={() => void switchToType()}
            />
          </View>
        ) : (
          <View className="mt-4 flex-row justify-center gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                transcriptVisible ? t('voice.hideTranscript') : t('voice.showTranscript')
              }
              className={`min-h-12 flex-1 flex-row items-center justify-center rounded-full border px-4 ${transcriptVisible ? 'border-brand bg-lavender' : 'border-border bg-surface'}`}
              onPress={() => setTranscriptVisible((value) => !value)}
            >
              <AppIcon color={colors.brand} name="fileText" size={20} />
              <Text className="ml-2 text-sm font-semibold text-brand">
                {transcriptVisible ? t('voice.hideTranscript') : t('voice.showTranscript')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('voice.openChat')}
              className="min-h-12 flex-1 flex-row items-center justify-center rounded-full border border-border bg-surface px-4"
              onPress={() => void switchToType()}
            >
              <AppIcon color={colors.brand} name="keyboard" size={21} />
              <Text className="ml-2 text-sm font-semibold text-brand">{t('voice.openChat')}</Text>
            </Pressable>
          </View>
        )}

        {transcriptVisible ? <VoiceTranscriptPanel messages={messages} /> : null}

        <View className="mt-4">
          <PrivacyNotice onPress={() => router.push('/(app)/privacy')} />
        </View>
      </ScrollView>
      <BottomTabBar active="home" showSpeechControls={false} />
    </SafeAreaView>
  );
}
