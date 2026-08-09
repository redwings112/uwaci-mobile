import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { Button } from '@/shared/components/Button/Button';

interface ConversationComposerProps {
  onSend: (text: string) => Promise<void>;
  disabled?: boolean;
  initialValue?: string;
}

export function ConversationComposer({
  onSend,
  disabled = false,
  initialValue = '',
}: ConversationComposerProps) {
  const [value, setValue] = useState(initialValue);
  const submit = async () => {
    const text = value.trim();
    if (!text) return;
    await onSend(text);
    setValue('');
  };
  return (
    <View className="flex-row items-end gap-2 border-t border-border bg-surface px-4 py-3">
      <TextInput
        accessibilityLabel="Your question"
        className="max-h-28 min-h-12 flex-1 rounded-control border border-border bg-canvas px-4 py-3 text-base text-ink"
        editable={!disabled}
        multiline
        onChangeText={setValue}
        onSubmitEditing={() => void submit()}
        placeholder="Ask a follow-up…"
        placeholderTextColor="#657168"
        returnKeyType="send"
        value={value}
      />
      <Button
        accessibilityLabel="Send question"
        className="h-12 px-4"
        disabled={disabled || !value.trim()}
        onPress={() => void submit()}
      >
        Send
      </Button>
    </View>
  );
}
