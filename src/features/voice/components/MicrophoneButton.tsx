import { Pressable, Text, View } from 'react-native';

import { Typography } from '@/shared/components/Typography/Typography';

import type { VoiceStatus } from '../types';

interface MicrophoneButtonProps {
  status: VoiceStatus;
  onPress: () => void;
  disabled?: boolean;
}

export function MicrophoneButton({ status, onPress, disabled = false }: MicrophoneButtonProps) {
  const recording = status === 'recording';
  const busy = ['processing_audio', 'uploading', 'transcribing', 'thinking'].includes(status);
  const label = recording
    ? 'Stop recording'
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
              : 'Requests microphone permission and starts recording'
          }
          accessibilityState={{ disabled: disabled || busy, busy }}
          className={`h-28 w-28 items-center justify-center rounded-full ${recording ? 'bg-danger' : 'bg-brand'} ${disabled ? 'opacity-50' : ''}`}
          disabled={disabled || busy}
          onPress={onPress}
        >
          <Text className="text-5xl text-white" importantForAccessibility="no">
            {recording ? '■' : '●'}
          </Text>
        </Pressable>
      </View>
      <Typography variant="label" className="text-center">
        {recording ? 'Tap to finish' : busy ? 'Working on your question…' : 'Tap to speak'}
      </Typography>
    </View>
  );
}
