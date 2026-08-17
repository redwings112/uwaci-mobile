import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppIcon, type AppIconName } from '@/shared/components/AppIcon/AppIcon';
import { colors } from '@/theme/tokens';

interface VoiceActionRowProps {
  onTypeInstead: () => void;
  onCancel: () => void;
  onAsk: () => void;
  askDisabled?: boolean;
}

interface VoiceActionProps {
  icon: AppIconName;
  label: string;
  hint?: string;
  accessibilityLabel: string;
  disabled?: boolean;
  onPress: () => void;
}

function VoiceAction({
  icon,
  label,
  hint,
  accessibilityLabel,
  disabled = false,
  onPress,
}: VoiceActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      className={`flex-1 items-center ${disabled ? 'opacity-50' : ''}`}
      disabled={disabled}
      onPress={onPress}
    >
      <View className="h-14 w-14 items-center justify-center rounded-full border border-border bg-surface dark:border-white/10 dark:bg-white/5">
        <AppIcon color={colors.brand} name={icon} size={24} />
      </View>
      <Text className="mt-2 text-xs font-semibold text-ink dark:text-white">{label}</Text>
      {hint ? <Text className="mt-0.5 text-center text-[11px] text-brand">{hint}</Text> : null}
    </Pressable>
  );
}

export function VoiceActionRow({
  onTypeInstead,
  onCancel,
  onAsk,
  askDisabled = false,
}: VoiceActionRowProps) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-start justify-between gap-3">
      <VoiceAction
        icon="keyboard"
        label={t('voice.typeInstead')}
        accessibilityLabel={t('voice.openChat')}
        onPress={onTypeInstead}
      />
      <VoiceAction
        icon="x"
        label={t('common.cancel')}
        accessibilityLabel={t('voice.cancelRecording')}
        onPress={onCancel}
      />
      <VoiceAction
        icon="globe"
        label={t('voice.askUwaci')}
        hint={t('voice.askUwaciHint')}
        accessibilityLabel={t('voice.stopAndAnswer')}
        disabled={askDisabled}
        onPress={onAsk}
      />
    </View>
  );
}
