import { View } from 'react-native';

import { Typography } from '@/shared/components/Typography/Typography';

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View className="items-center gap-2 p-8">
      <Typography variant="title">{title}</Typography>
      <Typography className="text-center text-muted">{message}</Typography>
    </View>
  );
}
