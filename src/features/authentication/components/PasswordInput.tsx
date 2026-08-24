import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { AppIcon } from '@/shared/components/AppIcon/AppIcon';
import { colors } from '@/theme/tokens';
import { useTranslation } from 'react-i18next';

interface PasswordInputProps {
  value: string;
  onChangeText: (value: string) => void;
  mode: 'sign-in' | 'sign-up';
}

export function PasswordInput({ value, onChangeText, mode }: PasswordInputProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const actionLabel = visible ? t('a11y.hidePassword') : t('a11y.showPassword');

  return (
    <View className="relative mt-2">
      <TextInput
        accessibilityLabel={t('a11y.password')}
        autoCapitalize="none"
        autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
        className="min-h-12 rounded-control border border-border bg-canvas px-4 pr-14 text-ink dark:border-white/10 dark:bg-[#111126] dark:text-white"
        onChangeText={onChangeText}
        placeholder={t('auth.passwordPlaceholder')}
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
        <AppIcon color={colors.brand} name={visible ? 'eyeOff' : 'eye'} size={24} />
      </Pressable>
    </View>
  );
}
