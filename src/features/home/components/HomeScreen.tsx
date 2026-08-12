import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ensureAuthSession } from '@/core/auth/authSession';
import { getLanguage } from '@/core/constants/languages';
import { mapApiError } from '@/core/errors/mapApiError';
import { speechService } from '@/core/speech/speechService';
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
import { selectPreferredLanguage } from '@/features/language/state/selectors';
import { VoiceOrb } from '@/features/voice/components/VoiceOrb';
import { VoiceTranscriptPanel } from '@/features/voice/components/VoiceTranscriptPanel';
import { useVoiceQuery } from '@/features/voice/hooks/useVoiceQuery';
import { useVoiceRecorder } from '@/features/voice/hooks/useVoiceRecorder';
import { voiceFailed, voiceReset, voiceStatusChanged } from '@/features/voice/state/voiceSlice';
import { getThinkingPrompt } from '@/features/voice/voicePrompts';
import { AppHeader } from '@/shared/components/AppHeader/AppHeader';
import { AppIcon } from '@/shared/components/AppIcon/AppIcon';
import { BottomTabBar } from '@/shared/components/BottomTabBar/BottomTabBar';
import { SurfaceCard } from '@/shared/components/SurfaceCard/SurfaceCard';
import { Typography } from '@/shared/components/Typography/Typography';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

interface HomeScreenProps {
  startRecording?: boolean;
  conversationId?: string;
}

const busyStatuses = [
  'requesting_permission',
  'stopping',
  'processing_audio',
  'uploading',
  'transcribing',
  'thinking',
] as const;

export function HomeScreen({ startRecording = false, conversationId }: HomeScreenProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectPreferredLanguage);
  const messages = useAppSelector(selectConversationMessages);
  const activeConversationId = useAppSelector(selectActiveConversationId);
  const requestError = useAppSelector((state) => state.conversation.errorMessage);
  const reduceMotion = useAppSelector((state) => state.settings.reduceMotion);
  const recorder = useVoiceRecorder();
  const voiceQuery = useVoiceQuery();
  const playback = useSpeechPlayback();
  const [showLanguage, setShowLanguage] = useState(false);
  const [transcriptVisible, setTranscriptVisible] = useState(false);
  const [thinkingPrompt, setThinkingPrompt] = useState<string | null>(null);
  const initialActionHandled = useRef(false);
  const mounted = useRef(true);
  const voiceActionInProgress = useRef(false);
  const turn = useRef(0);
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
      void speechService.stop();
    },
    [],
  );

  useEffect(() => {
    if (!requestedConversationId) return;
    dispatch(conversationOpened(requestedConversationId));
  }, [dispatch, requestedConversationId]);

  useEffect(() => {
    if (remoteConversation.data) dispatch(conversationLoaded(remoteConversation.data.messages));
  }, [dispatch, remoteConversation.data]);

  const begin = useCallback(async () => {
    try {
      await ensureAuthSession();
    } catch {
      router.push({ pathname: '/(auth)/sign-in', params: { next: 'voice' } });
      return;
    }
    if (!mounted.current) return;
    await speechService.stop();
    setThinkingPrompt(null);
    dispatch(requestErrorCleared());
    await recorder.start();
  }, [dispatch, recorder, router]);

  useEffect(() => {
    if (initialActionHandled.current || !startRecording) return;
    initialActionHandled.current = true;
    void begin();
  }, [begin, startRecording]);

  const completeVoiceTurn = async () => {
    const audio = await recorder.stop();
    if (!audio || !mounted.current) return;
    const prompt = getThinkingPrompt(language, turn.current++);
    setThinkingPrompt(prompt);
    dispatch(requestStarted());
    void speechService.speak(
      prompt,
      { language: getLanguage(language).speechLocale, rate: 0.92 },
      'voice-thinking',
    );
    try {
      const result = await voiceQuery.submit({
        uri: audio.uri,
        preferredLanguage: language,
        ...(serverConversationId ? { conversationId: serverConversationId } : {}),
      });
      if (!mounted.current) return;
      dispatch(conversationOpened(result.conversationId));
      dispatch(messageAdded(result.userMessage));
      dispatch(messageAdded(result.assistantMessage));
      dispatch(requestFinished());
      setThinkingPrompt(null);
      const responseLanguage = result.voiceAction?.language ?? language;
      if (result.voiceAction?.type === 'language_changed')
        dispatch(preferredLanguageChanged(result.voiceAction.language));
      dispatch(voiceStatusChanged('speaking'));
      await speechService.speak(
        result.assistantMessage.content,
        {
          language: getLanguage(responseLanguage).speechLocale,
          onDone: () => dispatch(voiceStatusChanged('idle')),
          onStopped: () => dispatch(voiceStatusChanged('idle')),
          onError: () =>
            dispatch(
              voiceFailed('The spoken answer could not start. Tap the transcript to read it.'),
            ),
        },
        result.assistantMessage.id,
      );
    } catch (error: unknown) {
      if (!mounted.current) return;
      setThinkingPrompt(null);
      dispatch(requestFailed(mapApiError(error).message));
    }
  };

  const handleOrbPress = async () => {
    if (voiceActionInProgress.current) return;
    voiceActionInProgress.current = true;
    try {
      if (speaking && !recording) {
        await speechService.stop();
        if (mounted.current) dispatch(voiceStatusChanged('idle'));
      } else if (recording) await completeVoiceTurn();
      else if (!busy) await begin();
    } finally {
      voiceActionInProgress.current = false;
    }
  };

  const cancelRecording = async () => {
    if (!recording) return;
    await recorder.cancel();
    if (mounted.current) {
      setThinkingPrompt(null);
      dispatch(requestErrorCleared());
    }
  };

  const startNewVoiceConversation = async () => {
    await speechService.stop();
    await recorder.cancel();
    dispatch(conversationReset());
    dispatch(voiceReset());
    setTranscriptVisible(false);
    setThinkingPrompt(null);
    router.replace('/(app)');
  };

  const switchToType = async () => {
    await speechService.stop();
    await recorder.cancel();
    router.push({
      pathname: '/(app)/conversation/[conversationId]',
      params: { conversationId: serverConversationId ?? 'new', focusComposer: 'true' },
    });
  };

  const statusTitle = recording
    ? "I'm listening"
    : busy
      ? (thinkingPrompt ?? 'Uwaci is thinking')
      : speaking
        ? 'Uwaci is speaking'
        : messages.length
          ? 'Ready for your next question'
          : 'Talk naturally with Uwaci';
  const statusCaption = recording
    ? 'Tap the orb when you are finished.'
    : busy
      ? 'I heard you. Your answer is on the way.'
      : speaking
        ? 'Tap the moving orb to stop the answer.'
        : 'Tap the orb, speak, then tap again to send.';

  return (
    <SafeAreaView className="flex-1 bg-canvas dark:bg-[#111126]" edges={['top', 'bottom']}>
      <AppHeader onMenu={() => router.push('/(app)/profile')} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose voice conversation language"
            className="min-h-11 justify-center rounded-full border border-border bg-surface px-4"
            onPress={() => setShowLanguage((value) => !value)}
          >
            <View className="flex-row items-center gap-2">
              <AppIcon color="#215C45" name="globe" size={19} />
              <Text className="text-sm font-semibold text-brand">
                {getLanguage(language).nativeLabel}
              </Text>
              <AppIcon color="#215C45" name="chevronDown" size={17} />
            </View>
          </Pressable>
          <Pressable
            accessibilityLabel="Start a new voice conversation"
            className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface"
            onPress={() => void startNewVoiceConversation()}
          >
            <AppIcon color="#215C45" name="messageSquare" size={21} />
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
            disabled={voiceQuery.isLoading}
            reduceMotion={reduceMotion}
            status={recorder.status}
            onPress={() => void handleOrbPress()}
          />
          <Typography variant="title" className="mt-1 max-w-80 text-center">
            {statusTitle}
          </Typography>
          <Typography variant="caption" className="mt-2 max-w-72 text-center leading-5">
            {statusCaption}
          </Typography>
          {recording ? (
            <View className="mt-3 flex-row items-center gap-2 rounded-full bg-danger/10 px-4 py-2">
              <View className="h-2.5 w-2.5 rounded-full bg-danger" />
              <Text className="text-xs font-semibold text-danger">
                Listening · {Math.floor(recorder.durationMillis / 1000)}s
              </Text>
              <Pressable
                accessibilityLabel="Cancel recording"
                onPress={() => void cancelRecording()}
              >
                <Text className="ml-2 text-xs font-semibold text-danger underline">Cancel</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {requestError || recorder.errorMessage ? (
          <SurfaceCard className="mt-3 border border-danger/30 bg-danger/5 p-3">
            <Text className="text-center text-sm text-danger">
              {requestError ?? recorder.errorMessage}
            </Text>
          </SurfaceCard>
        ) : null}

        <View className="mt-4 flex-row justify-center gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              transcriptVisible ? 'Hide voice transcript' : 'Show voice transcript'
            }
            className={`min-h-12 flex-1 flex-row items-center justify-center rounded-full border px-4 ${transcriptVisible ? 'border-brand bg-lavender' : 'border-border bg-surface'}`}
            onPress={() => setTranscriptVisible((value) => !value)}
          >
            <AppIcon color="#215C45" name="fileText" size={20} />
            <Text className="ml-2 text-sm font-semibold text-brand">
              {transcriptVisible ? 'Hide transcript' : 'Transcript'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Switch to typed chat"
            className="min-h-12 flex-1 flex-row items-center justify-center rounded-full border border-border bg-surface px-4"
            onPress={() => void switchToType()}
          >
            <AppIcon color="#215C45" name="keyboard" size={21} />
            <Text className="ml-2 text-sm font-semibold text-brand">Type instead</Text>
          </Pressable>
        </View>

        {transcriptVisible ? <VoiceTranscriptPanel messages={messages} /> : null}

        <View className="mt-4 flex-row items-start rounded-2xl bg-lavender/70 px-4 py-3 dark:bg-white/5">
          <AppIcon color="#6F45EF" name="sparkle" size={19} />
          <Text className="ml-2 flex-1 text-xs leading-5 text-muted">
            You can say “switch language to French”, English, Lingala, or Swahili at any time.
          </Text>
        </View>
      </ScrollView>
      <BottomTabBar active="chat" showSpeechControls={false} />
    </SafeAreaView>
  );
}
