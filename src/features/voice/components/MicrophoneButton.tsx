import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppIcon } from '@/shared/components/AppIcon/AppIcon';
import { Typography } from '@/shared/components/Typography/Typography';

import type { VoiceStatus } from '../types';

interface MicrophoneButtonProps {
  status: VoiceStatus;
  onPress: () => void;
  disabled?: boolean;
}

export function MicrophoneButton({ status, onPress, disabled = false }: MicrophoneButtonProps) {
  const { t } = useTranslation();
  const recording = status === 'recording';
  const speaking = status === 'speaking';
  const busy = ['processing_audio', 'uploading'].includes(status);
  const label = recording
    ? t('voice.micStopRecording')
    : speaking
      ? t('voice.micStopSpoken')
      : busy
        ? t('voice.micProcessing')
        : t('voice.micStart');
  return (
    <View className="items-center gap-4">
      <View className={`rounded-full p-3 ${recording ? 'bg-red-100' : 'bg-brand/10'}`}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityHint={
            recording
              ? t('voice.micHintStop')
              : speaking
                ? t('voice.micHintStopSpoken')
                : t('voice.micHintStart')
          }
          accessibilityState={{ disabled: disabled || busy, busy }}
          className={`h-28 w-28 items-center justify-center rounded-full ${recording ? 'bg-danger' : 'bg-brand'} ${disabled ? 'opacity-50' : ''}`}
          disabled={disabled || busy}
          onPress={onPress}
        >
          <AppIcon color="#FFFFFF" name={recording || speaking ? 'square' : 'mic'} size={48} />
        </Pressable>
      </View>
      <Typography variant="label" className="text-center">
        {recording
          ? t('voice.micTapToFinish')
          : speaking
            ? t('voice.micTapToStopListening')
            : busy
              ? t('voice.micWorking')
              : t('voice.micTapToSpeak')}
      </Typography>
    </View>
  );
}
