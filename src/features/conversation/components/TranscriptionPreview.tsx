import { View } from 'react-native';

import { Typography } from '@/shared/components/Typography/Typography';

export function TranscriptionPreview({ text }: { text: string }) {
  return (
    <View className="mb-3 rounded-control bg-brand/5 p-3">
      <Typography variant="caption" className="mb-1 font-semibold uppercase">
        Uwaci heard
      </Typography>
      <Typography>{text}</Typography>
    </View>
  );
}
