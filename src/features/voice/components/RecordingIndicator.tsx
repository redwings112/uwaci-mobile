import { View } from 'react-native';

import { Typography } from '@/shared/components/Typography/Typography';

import { RecordingTimer } from './RecordingTimer';

export function RecordingIndicator({ durationMillis }: { durationMillis: number }) {
  return (
    <View className="flex-row items-center justify-center gap-2" accessibilityLiveRegion="polite">
      <View className="h-3 w-3 rounded-full bg-danger" />
      <Typography variant="label">Recording</Typography>
      <RecordingTimer durationMillis={durationMillis} />
    </View>
  );
}
