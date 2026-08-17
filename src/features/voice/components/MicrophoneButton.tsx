import { Pressable, View } from 'react-native';

import { AppIcon } from '@/shared/components/AppIcon/AppIcon';
import { Typography } from '@/shared/components/Typography/Typography';

import type { VoiceStatus } from '../types';

interface MicrophoneButtonProps {
  status: VoiceStatus;
  onPress: () => void;
  disabled?: boolean;
}

export function MicrophoneButton({ status, onPress, disabled = false }: MicrophoneButtonProps) {
  const recording = status === 'recording';
  const speaking = status === 'speaking';
  const busy = ['processing_audio', 'uploading'].includes(status);
  const label = recording
    ? 'Stop recording'
    : speaking
      ? 'Stop spoken answer'
      : busy
        ? 'Voice question is processing'
        : 'Start voice recording';
  return (
    <View className="items-center gap-4">
      <View className={`rounded-full p-3 ${recording ? 'bg-red-100' : 'bg-brand/10'}`}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityHint={
            recording
              ? 'Stops and sends your question'
              : speaking
                ? 'Stops the answer being read aloud'
                : 'Requests microphone permission and starts recording'
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
          ? 'Tap to finish'
          : speaking
            ? 'Tap to stop listening'
            : busy
              ? 'Working on your question…'
              : 'Tap to speak'}
      </Typography>
    </View>
  );
}
