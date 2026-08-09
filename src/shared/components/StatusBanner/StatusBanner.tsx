import { View } from 'react-native';

import { Typography } from '@/shared/components/Typography/Typography';

type StatusBannerVariant = 'info' | 'warning' | 'error';

const variants: Record<StatusBannerVariant, string> = {
  info: 'border-brand/20 bg-brand/5',
  warning: 'border-accent/40 bg-amber-50',
  error: 'border-danger/30 bg-red-50',
};

export function StatusBanner({
  message,
  title,
  variant = 'info',
}: {
  message: string;
  title?: string;
  variant?: StatusBannerVariant;
}) {
  return (
    <View
      className={`rounded-control border p-4 ${variants[variant]}`}
      accessibilityRole={variant === 'error' ? 'alert' : 'summary'}
      accessibilityLiveRegion="polite"
    >
      {title ? <Typography variant="label">{title}</Typography> : null}
      <Typography className={title ? 'mt-1 text-muted' : 'text-ink'}>{message}</Typography>
    </View>
  );
}
