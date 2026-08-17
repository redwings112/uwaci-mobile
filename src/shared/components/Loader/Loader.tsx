import { ActivityIndicator, View } from 'react-native';

import { Typography } from '@/shared/components/Typography/Typography';
import { colors } from '@/theme/tokens';

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
      <ActivityIndicator color={colors.brand} size="large" />
      <Typography className="text-muted">{label}</Typography>
    </View>
  );
}
