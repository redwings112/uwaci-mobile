import { View } from 'react-native';

import { Typography } from '@/shared/components/Typography/Typography';

import { AudioWaveform } from './AudioWaveform';
import { RecordingTimer } from './RecordingTimer';

export function RecordingIndicator({
  durationMillis,
  audioLevel = 0,
}: {
  durationMillis: number;
  audioLevel?: number;
}) {
  return (
    <View className="items-center" accessibilityLiveRegion="polite">
      <View className="flex-row items-center justify-center gap-2">
        <View className="h-3 w-3 rounded-full bg-danger" />
        <Typography variant="label">Recording</Typography>
        <RecordingTimer durationMillis={durationMillis} />
      </View>
      <AudioWaveform active level={audioLevel} />
    </View>
  );
}
