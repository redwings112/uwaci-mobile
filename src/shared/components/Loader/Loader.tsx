import { ActivityIndicator, View } from 'react-native';

import { Typography } from '@/shared/components/Typography/Typography';

interface LoaderProps {
  fullScreen?: boolean;
  label?: string;
}

export function Loader({ fullScreen = false, label = 'Loading' }: LoaderProps) {
  return (
    <View
      className={`${fullScreen ? 'flex-1' : ''} items-center justify-center gap-3 bg-canvas p-6 dark:bg-[#111126]`}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
    >
      <ActivityIndicator color="#215C45" size="large" />
      <Typography className="text-muted">{label}</Typography>
    </View>
  );
}
