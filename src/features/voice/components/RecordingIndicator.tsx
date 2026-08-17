import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <View className="items-center" accessibilityLiveRegion="polite">
      <View className="flex-row items-center justify-center gap-2">
        <View className="h-3 w-3 rounded-full bg-danger" />
        <Typography variant="label">{t('voice.recording')}</Typography>
        <RecordingTimer durationMillis={durationMillis} />
      </View>
      <AudioWaveform active level={audioLevel} />
    </View>
  );
}
