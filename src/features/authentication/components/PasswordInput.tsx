import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

interface PasswordInputProps {
  value: string;
  onChangeText: (value: string) => void;
  mode: 'sign-in' | 'sign-up';
}

export function PasswordInput({ value, onChangeText, mode }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const actionLabel = visible ? 'Hide password' : 'Show password';

  return (
    <View className="relative mt-2">
      <TextInput
        accessibilityLabel="Password"
        autoCapitalize="none"
        autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
        className="min-h-12 rounded-control border border-border bg-canvas px-4 pr-14 text-ink dark:border-white/10 dark:bg-[#111126] dark:text-white"
        onChangeText={onChangeText}
        placeholder="At least 6 characters"
        placeholderTextColor="#777789"
        secureTextEntry={!visible}
        value={value}
      />
      <Pressable
        accessibilityLabel={actionLabel}
        accessibilityRole="button"
        className="absolute bottom-0 right-0 top-0 min-h-12 w-12 items-center justify-center"
        hitSlop={8}
        onPress={() => setVisible((current) => !current)}
      >
        <View className="h-4 w-7 items-center justify-center rounded-full border-2 border-brand">
          <View className="h-2 w-2 rounded-full bg-brand" />
          {!visible ? <View className="absolute h-0.5 w-8 rotate-45 bg-brand" /> : null}
        </View>
      </Pressable>
    </View>
  );
}
