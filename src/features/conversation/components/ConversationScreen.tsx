import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getLanguage } from '@/core/constants/languages';
import { mapApiError } from '@/core/errors/mapApiError';
import { speechService } from '@/core/speech/speechService';
import { FeedbackSheet } from '@/features/feedback/components/FeedbackSheet';
import { useSubmitFeedbackMutation } from '@/features/feedback/api/feedbackApi';
import type { FeedbackCategory } from '@/features/feedback/types';
import { selectPreferredLanguage } from '@/features/language/state/selectors';
import { AudioWaveform } from '@/features/voice/components/AudioWaveform';
import { MicrophoneButton } from '@/features/voice/components/MicrophoneButton';
import { RecordingIndicator } from '@/features/voice/components/RecordingIndicator';
import { useVoiceQuery } from '@/features/voice/hooks/useVoiceQuery';
import { useVoiceRecorder } from '@/features/voice/hooks/useVoiceRecorder';
import { voiceReset } from '@/features/voice/state/voiceSlice';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { IconButton } from '@/shared/components/IconButton/IconButton';
import { Typography } from '@/shared/components/Typography/Typography';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { useGetConversationQuery, useSendTextQueryMutation } from '../api/conversationApi';
import {
  conversationLoaded,
  conversationOpened,
  conversationReset,
  messageAdded,
  requestFailed,
  requestFinished,
  requestStarted,
} from '../state/conversationSlice';
import { selectConversationMessages, selectConversationRequest } from '../state/selectors';
import type { QueryResult } from '../types';
import { ConversationComposer } from './ConversationComposer';
import { ConversationList } from './ConversationList';

interface ConversationScreenProps {
  conversationId: string;
  initialText?: string;
  startRecording?: boolean;
}

export function ConversationScreen({
  conversationId,
  initialText,
  startRecording = false,
}: ConversationScreenProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const messages = useAppSelector(selectConversationMessages);
  const request = useAppSelector(selectConversationRequest);
  const language = useAppSelector(selectPreferredLanguage);
  const voiceResponsesEnabled = useAppSelector((state) => state.settings.voiceResponsesEnabled);
  const recorder = useVoiceRecorder();
  const voiceQuery = useVoiceQuery();
  const [sendTextQuery] = useSendTextQueryMutation();
  const [submitFeedback, feedbackResult] = useSubmitFeedbackMutation();
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const initialActionHandled = useRef(false);
  const isLocalConversation = conversationId.startsWith('new-');
  const remoteConversation = useGetConversationQuery(conversationId, { skip: isLocalConversation });

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
    async (result: QueryResult, includeUserMessage: boolean) => {
      dispatch(conversationOpened(result.conversationId));
      if (includeUserMessage) dispatch(messageAdded(result.userMessage));
      dispatch(messageAdded(result.assistantMessage));
      dispatch(requestFinished());
      if (voiceResponsesEnabled) {
        await speechService.speak(result.assistantMessage.content, {
          language: getLanguage(language).speechLocale,
        });
      }
    },
    [dispatch, language, voiceResponsesEnabled],
  );

  const sendText = useCallback(
    async (text: string) => {
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
          ...(isLocalConversation ? {} : { conversation_id: conversationId }),
        }).unwrap();
        await acceptResult(result, false);
      } catch (error: unknown) {
        dispatch(requestFailed(mapApiError(error).message));
      }
    },
    [acceptResult, conversationId, dispatch, isLocalConversation, language, sendTextQuery],
  );

  const handleMicrophone = async () => {
    if (recorder.status !== 'recording') {
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
        ...(isLocalConversation ? {} : { conversationId }),
      });
      await acceptResult(result, true);
    } catch (error: unknown) {
      dispatch(requestFailed(mapApiError(error).message));
    }
  };

  useEffect(() => {
    if (initialActionHandled.current) return;
    initialActionHandled.current = true;
    if (initialText) void sendText(initialText);
    else if (startRecording) void recorder.start();
  }, [initialText, recorder, sendText, startRecording]);

  const startNewConversation = () => {
    dispatch(conversationReset());
    dispatch(voiceReset());
    router.replace('/');
  };

  const sendFeedback = async (category: FeedbackCategory) => {
    const lastAssistant = [...messages].reverse().find((message) => message.role === 'assistant');
    try {
      await submitFeedback({
        conversation_id: conversationId,
        ...(lastAssistant ? { message_id: lastAssistant.id } : {}),
        category,
      }).unwrap();
      setFeedbackVisible(false);
    } catch {
      // The sheet stays open so the user can retry or dismiss it.
    }
  };

  const busy = request.status === 'sending' || voiceQuery.isLoading;
  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
      <View className="flex-row items-center justify-between border-b border-border bg-canvas px-4 py-3">
        <IconButton
          icon="‹"
          label="Back to home"
          className="bg-surface"
          onPress={() => router.back()}
        />
        <View className="items-center">
          <Typography variant="label">Conversation</Typography>
          <Typography variant="caption">{getLanguage(language).nativeLabel}</Typography>
        </View>
        <IconButton
          icon="＋"
          label="New conversation"
          className="bg-surface"
          onPress={startNewConversation}
        />
      </View>

      <ConversationList messages={messages} />

      {request.errorMessage ? (
        <View className="px-4">
          <ErrorState message={request.errorMessage} />
        </View>
      ) : null}
      {recorder.status === 'recording' ? (
        <View className="px-4">
          <RecordingIndicator durationMillis={recorder.durationMillis} />
          <AudioWaveform active />
        </View>
      ) : null}
      {busy ? (
        <Typography className="px-5 py-2 text-center text-muted" accessibilityLiveRegion="polite">
          Uwaci is thinking…
        </Typography>
      ) : null}

      <View className="items-center border-t border-border bg-surface py-3">
        <MicrophoneButton
          status={recorder.status}
          disabled={request.status === 'sending'}
          onPress={() => void handleMicrophone()}
        />
      </View>
      <ConversationComposer disabled={busy || recorder.status === 'recording'} onSend={sendText} />
      {messages.some((message) => message.role === 'assistant') ? (
        <View className="bg-surface px-4 pb-3">
          <IconButton
            icon="♡"
            label="Give feedback on the last answer"
            className="bg-brand/10"
            onPress={() => setFeedbackVisible(true)}
          />
        </View>
      ) : null}
      <FeedbackSheet
        visible={feedbackVisible}
        submitting={feedbackResult.isLoading}
        onClose={() => setFeedbackVisible(false)}
        onSubmit={(category) => void sendFeedback(category)}
      />
    </SafeAreaView>
  );
}
