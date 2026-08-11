import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

interface ConversationComposerProps {
  onSend: (text: string) => Promise<void>;
  onMicrophone?: () => void;
  disabled?: boolean;
  initialValue?: string;
  autoFocus?: boolean;
}

export function ConversationComposer({
  onSend,
  onMicrophone,
  disabled = false,
  initialValue = '',
  autoFocus = false,
}: ConversationComposerProps) {
  const [value, setValue] = useState(initialValue);
  const input = useRef<TextInput>(null);
  useEffect(() => {
    if (autoFocus) requestAnimationFrame(() => input.current?.focus());
  }, [autoFocus]);
  const submit = async () => {
    const text = value.trim();
    if (!text) return;
    await onSend(text);
    setValue('');
  };
  return (
    <View
      className="mx-3 mb-2 flex-row items-center rounded-full border border-border bg-surface px-2 py-1.5"
      style={{ elevation: 3 }}
    >
      <Pressable
        accessibilityLabel="Ask by voice"
        className="h-10 w-10 items-center justify-center"
        disabled={disabled}
        onPress={onMicrophone}
      >
        <Text className="text-xl text-brand">♩</Text>
      </Pressable>
      <TextInput
        ref={input}
        accessibilityLabel="Your question"
        className="max-h-24 min-h-10 flex-1 px-2 text-sm text-ink"
        editable={!disabled}
        multiline
        onChangeText={setValue}
        onSubmitEditing={() => void submit()}
        placeholder="Ask anything, speak or type…"
        placeholderTextColor="#777789"
        returnKeyType="send"
        value={value}
      />
      <Text className="px-2 text-brand">▦</Text>
      <Pressable
        accessibilityLabel="Send question"
        className={`h-10 w-10 items-center justify-center rounded-full ${value.trim() ? 'bg-brand' : 'bg-lavender'}`}
        disabled={disabled || !value.trim()}
        onPress={() => void submit()}
      >
        <Text className={value.trim() ? 'text-white' : 'text-violet'}>➤</Text>
      </Pressable>
    </View>
  );
}
