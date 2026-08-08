import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LanguageSelector } from '@/features/language/components/LanguageSelector';
import { preferredLanguageChanged } from '@/features/language/state/languageSlice';
import { selectPreferredLanguage } from '@/features/language/state/selectors';
import { textQuerySchema } from '@/features/text_input/utils/textQuerySchema';
import { MicrophoneButton } from '@/features/voice/components/MicrophoneButton';
import { Screen } from '@/shared/components/Screen/Screen';
import { Typography } from '@/shared/components/Typography/Typography';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectPreferredLanguage);
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const openConversation = (params: { startRecording?: string; initialText?: string }) => {
    router.push({
      pathname: '/conversation/[conversationId]',
      params: { conversationId: `new-${Date.now()}`, ...params },
    });
  };

  const submitText = () => {
    const result = textQuerySchema.safeParse(text);
    if (!result.success) {
      setValidationMessage(result.error.issues[0]?.message ?? 'Enter a question first.');
      return;
    }
    setValidationMessage(null);
    openConversation({ initialText: result.data });
  };

  return (
    <Screen scroll className="justify-between pb-8">
      <View>
        <View className="mb-8 flex-row items-center justify-between">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand">
            <Typography variant="title" className="text-white">
              U
            </Typography>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            className="min-h-12 justify-center rounded-full border border-border bg-surface px-4"
            onPress={() => router.push('/settings')}
          >
            <Typography variant="label">Settings</Typography>
          </Pressable>
        </View>
        <Typography variant="label" className="mb-3 text-brand">
          {t('home.eyebrow')}
        </Typography>
        <Typography variant="display" className="mb-3">
          {t('home.title')}
        </Typography>
        <Typography className="mb-8 text-lg leading-7 text-muted">{t('home.subtitle')}</Typography>
        <Typography variant="label" className="mb-3">
          Preferred language
        </Typography>
        <LanguageSelector
          value={language}
          onChange={(value) => dispatch(preferredLanguageChanged(value))}
        />
      </View>

      <View className="my-10 items-center">
        <MicrophoneButton
          status="idle"
          onPress={() => openConversation({ startRecording: 'true' })}
        />
        <View className="mt-5 flex-row items-center gap-2">
          <View className="h-2 w-2 rounded-full bg-green-600" />
          <Typography variant="caption">{t('home.statusReady')}</Typography>
        </View>
      </View>

      <View>
        <Typography variant="label" className="mb-2">
          {t('home.typeInstead')}
        </Typography>
        <View className="flex-row items-center gap-2 rounded-card border border-border bg-surface p-2">
          <TextInput
            accessibilityLabel="Type your question"
            className="min-h-12 flex-1 px-3 text-base text-ink"
            onChangeText={(value) => {
              setText(value);
              if (validationMessage) setValidationMessage(null);
            }}
            onSubmitEditing={submitText}
            placeholder="How can Uwaci help?"
            placeholderTextColor="#657168"
            returnKeyType="send"
            value={text}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send question"
            className="h-12 w-12 items-center justify-center rounded-full bg-brand"
            onPress={submitText}
          >
            <Typography className="text-xl text-white">→</Typography>
          </Pressable>
        </View>
        {validationMessage ? (
          <Typography variant="caption" className="mt-2 text-danger" accessibilityRole="alert">
            {validationMessage}
          </Typography>
        ) : null}
      </View>
    </Screen>
  );
}
