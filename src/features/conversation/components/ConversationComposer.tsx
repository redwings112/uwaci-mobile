import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';

import { AppIcon } from '@/shared/components/AppIcon/AppIcon';
import { colors } from '@/theme/tokens';

interface ConversationComposerProps {
  onSend: (text: string) => Promise<void>;
  onMicrophone?: () => void;
  onVoiceMode?: () => void;
  onPrivacy?: () => void;
  inputDisabled?: boolean;
  sending?: boolean;
  microphoneDisabled?: boolean;
  microphoneActive?: boolean;
  initialValue?: string;
  autoFocus?: boolean;
  placeholder?: string;
}

export function ConversationComposer({
  onSend,
  onMicrophone,
  onVoiceMode,
  onPrivacy,
  inputDisabled = false,
  sending = false,
  microphoneDisabled = false,
  microphoneActive = false,
  initialValue = '',
  autoFocus = false,
  placeholder,
}: ConversationComposerProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialValue);
  const input = useRef<TextInput>(null);
  useEffect(() => {
    if (autoFocus) requestAnimationFrame(() => input.current?.focus());
  }, [autoFocus]);
  const submit = async () => {
    const text = value.trim();
    if (!text || sending) return;
    setValue('');
    await onSend(text);
  };
  return (
    <View
      className="mx-3 mb-2 flex-row items-center rounded-full border border-border bg-surface px-2 py-1.5"
      style={{ elevation: 3 }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('privacy.title')}
        className="h-10 w-10 items-center justify-center rounded-full bg-lavender"
        onPress={onPrivacy}
      >
        <AppIcon color={colors.brand} name="shield" size={21} />
      </Pressable>
      <TextInput
        ref={input}
        accessibilityLabel={t('conversation.questionA11y')}
        className="max-h-24 min-h-10 flex-1 px-2 text-sm text-ink"
        editable={!inputDisabled}
        multiline
        onChangeText={setValue}
        onSubmitEditing={() => void submit()}
        placeholder={placeholder ?? t('conversation.placeholder')}
        placeholderTextColor="#777789"
        returnKeyType="send"
        value={value}
      />
      <View className="px-1">
        <AppIcon color="#777789" name="paperclip" size={23} />
      </View>
      {sending ? (
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={t('voice.thinking')}
          className="h-10 w-10 items-center justify-center rounded-full bg-brand"
        >
          <ActivityIndicator color="#FFFFFF" size="small" />
        </View>
      ) : microphoneActive ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('voice.stopAndSend')}
          accessibilityState={{ disabled: microphoneDisabled }}
          className="h-10 w-10 items-center justify-center rounded-full bg-danger"
          disabled={microphoneDisabled}
          onPress={onMicrophone}
        >
          <AppIcon color="#FFFFFF" name="square" size={22} />
        </Pressable>
      ) : value.trim() ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('conversation.sendQuestion')}
          className="h-10 w-10 items-center justify-center rounded-full bg-brand"
          disabled={inputDisabled}
          onPress={() => void submit()}
        >
          <AppIcon color="#FFFFFF" name="send" size={22} />
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('conversation.askByVoice')}
          accessibilityState={{ disabled: microphoneDisabled }}
          className={`h-10 w-10 items-center justify-center rounded-full ${microphoneDisabled ? 'bg-lavender' : 'bg-brand'}`}
          disabled={microphoneDisabled}
          onPress={onMicrophone}
        >
          <AppIcon color={microphoneDisabled ? colors.brand : '#FFFFFF'} name="mic" size={22} />
        </Pressable>
      )}
    </View>
  );
}
