import { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { AppIcon } from '@/shared/components/AppIcon/AppIcon';

interface ConversationComposerProps {
  onSend: (text: string) => Promise<void>;
  onMicrophone?: () => void;
  inputDisabled?: boolean;
  microphoneDisabled?: boolean;
  microphoneActive?: boolean;
  initialValue?: string;
  autoFocus?: boolean;
}

export function ConversationComposer({
  onSend,
  onMicrophone,
  inputDisabled = false,
  microphoneDisabled = false,
  microphoneActive = false,
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
        accessibilityLabel={microphoneActive ? 'Stop recording and send' : 'Ask by voice'}
        accessibilityState={{ disabled: microphoneDisabled, selected: microphoneActive }}
        className={`h-10 w-10 items-center justify-center rounded-full ${microphoneActive ? 'bg-danger' : ''}`}
        disabled={microphoneDisabled}
        onPress={onMicrophone}
      >
        <AppIcon
          color={microphoneActive ? '#FFFFFF' : '#215C45'}
          name={microphoneActive ? 'square' : 'mic'}
          size={27}
        />
      </Pressable>
      <TextInput
        ref={input}
        accessibilityLabel="Your question"
        className="max-h-24 min-h-10 flex-1 px-2 text-sm text-ink"
        editable={!inputDisabled}
        multiline
        onChangeText={setValue}
        onSubmitEditing={() => void submit()}
        placeholder="Ask anything, speak or type…"
        placeholderTextColor="#777789"
        returnKeyType="send"
        value={value}
      />
      <View className="px-1">
        <AppIcon color="#777789" name="paperclip" size={23} />
      </View>
      <Pressable
        accessibilityLabel="Send question"
        className={`h-10 w-10 items-center justify-center rounded-full ${value.trim() ? 'bg-brand' : 'bg-lavender'}`}
        disabled={inputDisabled || !value.trim()}
        onPress={() => void submit()}
      >
        <AppIcon color={value.trim() ? '#FFFFFF' : '#6F45EF'} name="send" size={22} />
      </Pressable>
    </View>
  );
}
