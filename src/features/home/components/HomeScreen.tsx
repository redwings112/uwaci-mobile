import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { mapApiError } from '@/core/errors/mapApiError';
import { ensureAuthSession } from '@/core/auth/authSession';
import { AppHeader } from '@/shared/components/AppHeader/AppHeader';
import { BottomTabBar } from '@/shared/components/BottomTabBar/BottomTabBar';
import { SurfaceCard } from '@/shared/components/SurfaceCard/SurfaceCard';
import { Typography } from '@/shared/components/Typography/Typography';
import { LanguageSelector } from '@/features/language/components/LanguageSelector';
import { preferredLanguageChanged } from '@/features/language/state/languageSlice';
import { selectPreferredLanguage } from '@/features/language/state/selectors';
import { useVoiceQuery } from '@/features/voice/hooks/useVoiceQuery';
import { useVoiceRecorder } from '@/features/voice/hooks/useVoiceRecorder';
import {
  conversationOpened,
  conversationReset,
  messageAdded,
  requestFailed,
  requestFinished,
  requestStarted,
} from '@/features/conversation/state/conversationSlice';
import { voiceReset } from '@/features/voice/state/voiceSlice';
import { AppIcon } from '@/shared/components/AppIcon/AppIcon';
import { recordHistory } from '@/features/library/storage/libraryStorage';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const waveform = [8, 14, 22, 30, 18, 38, 26, 16, 32, 21, 12, 25, 36, 17, 10];

export function HomeScreen({ startRecording = false }: { startRecording?: boolean }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectPreferredLanguage);
  const requestError = useAppSelector((state) => state.conversation.errorMessage);
  const network = useAppSelector((state) => state.network);
  const recorder = useVoiceRecorder();
  const voiceQuery = useVoiceQuery();
  const [showLanguage, setShowLanguage] = useState(false);
  const recording = recorder.status === 'recording';
  const busy =
    ['processing_audio', 'uploading', 'transcribing', 'thinking'].includes(recorder.status) ||
    voiceQuery.isLoading;
  const offline = network.initialized && network.isConnected === false;
  const initialActionHandled = useRef(false);

  const begin = useCallback(async () => {
    if (offline) {
      dispatch(requestFailed('You are offline. Reconnect before recording a question.'));
      return;
    }
    try {
      await ensureAuthSession();
    } catch {
      router.push({ pathname: '/(auth)/sign-in', params: { next: 'voice' } });
      return;
    }
    await recorder.start();
  }, [dispatch, offline, recorder, router]);

  useEffect(() => {
    if (initialActionHandled.current || !startRecording) return;
    initialActionHandled.current = true;
    void begin();
  }, [begin, startRecording]);

  const askUwaci = async () => {
    if (!recording) {
      await begin();
      return;
    }
    const audio = await recorder.stop();
    if (!audio) return;
    dispatch(requestStarted());
    try {
      const result = await voiceQuery.submit({ uri: audio.uri, preferredLanguage: language });
      dispatch(conversationReset());
      dispatch(conversationOpened(result.conversationId));
      dispatch(messageAdded(result.userMessage));
      dispatch(messageAdded(result.assistantMessage));
      dispatch(requestFinished());
      void recordHistory({
        conversationId: result.conversationId,
        title: result.userMessage.content.slice(0, 48),
        preview: result.assistantMessage.content.slice(0, 120),
        updatedAt: result.assistantMessage.createdAt,
      });
      router.push({
        pathname: '/(app)/conversation/[conversationId]',
        params: { conversationId: result.conversationId },
      });
    } catch (error: unknown) {
      dispatch(requestFailed(mapApiError(error).message));
    }
  };

  const cancel = async () => {
    await recorder.cancel();
    dispatch(voiceReset());
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas dark:bg-[#111126]" edges={['top', 'bottom']}>
      <AppHeader onMenu={() => router.push('/(app)/profile')} />
      <View className="flex-1 px-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose conversation language"
          className="mb-3 min-h-12 justify-center self-center rounded-full border border-border bg-surface px-5"
          onPress={() => setShowLanguage((value) => !value)}
        >
          <View className="flex-row items-center gap-2">
            <AppIcon color="#215C45" name="globe" size={20} />
            <Text className="text-sm font-semibold text-brand">
              Auto-detect · {language.toUpperCase()}
            </Text>
            <AppIcon color="#215C45" name="chevronDown" size={18} />
          </View>
        </Pressable>
        {showLanguage ? (
          <View className="z-10 mb-2">
            <LanguageSelector
              value={language}
              onChange={(value) => {
                dispatch(preferredLanguageChanged(value));
                setShowLanguage(false);
              }}
            />
          </View>
        ) : null}

        <View className="items-center pt-1">
          <View className="mb-1 h-3 w-3 rounded-full bg-accent" />
          <View className="h-52 w-52 items-center justify-center rounded-full border border-dashed border-brand/30">
            <View className="h-44 w-44 items-center justify-center rounded-full border border-violet/30 bg-lavender">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={recording ? 'Recording in progress' : 'Start voice recording'}
                className="h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-brand"
                disabled={busy}
                onPress={() => void (recording ? askUwaci() : begin())}
              >
                <AppIcon
                  color="#FFFFFF"
                  name={recording ? 'square' : 'mic'}
                  size={58}
                  strokeWidth={2.2}
                />
                <View className="absolute bottom-4 flex-row items-end gap-0.5">
                  {waveform.map((height, index) => (
                    <View
                      key={`${height}-${index}`}
                      className="w-0.5 rounded-full bg-white/50"
                      style={{
                        height: recording
                          ? Math.max(3, (height / 2) * (0.2 + recorder.audioLevel * 0.8))
                          : 3,
                      }}
                    />
                  ))}
                </View>
              </Pressable>
            </View>
          </View>
          <Typography variant="title" className="mt-3 text-center">
            {busy ? 'Uwaci is thinking…' : recording ? "I'm listening…" : 'Ask Uwaci'}
          </Typography>
          <Typography variant="caption" className="mt-1 text-center">
            {recording
              ? "Speak clearly. I'll catch every word."
              : 'Tap the microphone and speak naturally.'}
          </Typography>
        </View>

        <SurfaceCard className="mt-5 min-h-32 p-5">
          <View className="flex-row items-center gap-2">
            <AppIcon color="#215C45" name="audioLines" size={18} />
            <Text className="text-xs font-semibold text-brand">Live transcription</Text>
          </View>
          <Typography className="mt-2 font-medium">
            {recording
              ? 'Audio is being captured securely…'
              : 'Your transcript will appear after Uwaci processes the recording.'}
          </Typography>
          <View className="mt-3 flex-row items-center gap-1">
            {[0, 1, 2, 3].map((dot) => (
              <View
                key={dot}
                className={`h-1.5 w-1.5 rounded-full ${recording ? 'bg-brand' : 'bg-border'}`}
              />
            ))}
            <Typography variant="caption" className="ml-2">
              {recording ? `Listening · ${Math.floor(recorder.durationMillis / 1000)}s` : 'Ready'}
            </Typography>
          </View>
        </SurfaceCard>

        {requestError || recorder.errorMessage ? (
          <Text className="mt-2 text-center text-sm text-danger">
            {requestError ?? recorder.errorMessage}
          </Text>
        ) : null}
        <View className="mt-3 flex-row items-start justify-around">
          <Pressable
            className="min-h-20 w-28 items-center justify-center"
            onPress={() => {
              void cancel();
              router.push({
                pathname: '/(app)/conversation/[conversationId]',
                params: { conversationId: 'new', focusComposer: 'true' },
              });
            }}
          >
            <View className="h-14 w-14 items-center justify-center rounded-full border border-border bg-surface">
              <AppIcon color="#215C45" name="keyboard" size={28} />
            </View>
            <Text className="mt-2 text-xs font-medium text-ink dark:text-white">Type instead</Text>
          </Pressable>
          <Pressable
            className="min-h-20 w-28 items-center justify-center"
            disabled={!recording}
            onPress={() => void cancel()}
          >
            <View className="h-14 w-14 items-center justify-center rounded-full border border-border bg-surface">
              <AppIcon color="#6F45EF" name="x" size={29} />
            </View>
            <Text className="mt-2 text-xs font-medium text-ink dark:text-white">Cancel</Text>
          </Pressable>
          <Pressable
            className="min-h-20 w-28 items-center justify-center"
            onPress={() => void askUwaci()}
          >
            <View className="h-14 w-14 items-center justify-center rounded-full border-2 border-brand bg-lavender">
              <AppIcon color="#6F45EF" name={recording ? 'square' : 'mic'} size={28} />
            </View>
            <Text className="mt-2 text-xs font-medium text-ink dark:text-white">Ask Uwaci</Text>
            <Text className="mt-0.5 text-center text-xs text-violet">
              {recording ? 'Stop and get my answer' : 'Start speaking'}
            </Text>
          </Pressable>
        </View>

        <Pressable
          className="mb-3 mt-auto min-h-16 flex-row items-center rounded-control border border-border bg-surface px-4"
          onPress={() => router.push('/(app)/profile')}
        >
          <View className="h-9 w-9 items-center justify-center rounded-full bg-lavender">
            <AppIcon color="#215C45" name="shield" size={22} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-semibold text-ink dark:text-white">
              Your data is private
            </Text>
            <Text className="mt-0.5 text-xs text-muted">Uwaci protects your conversations.</Text>
          </View>
          <AppIcon color="#777789" name="chevronRight" size={22} />
        </Pressable>
      </View>
      <BottomTabBar active="chat" />
    </SafeAreaView>
  );
}
