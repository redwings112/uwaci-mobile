import { View } from 'react-native';

import { Button } from '@/shared/components/Button/Button';
import { Typography } from '@/shared/components/Typography/Typography';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View
      accessible
      accessibilityLabel={`Error: ${message}`}
      className="gap-3 rounded-card border border-danger/20 bg-red-50 p-4"
      accessibilityRole="alert"
    >
      <Typography variant="label" className="text-danger">
        Something went wrong
      </Typography>
      <Typography>{message}</Typography>
      {onRetry ? (
        <Button variant="secondary" onPress={onRetry}>
          Try again
        </Button>
      ) : null}
    </View>
  );
}
