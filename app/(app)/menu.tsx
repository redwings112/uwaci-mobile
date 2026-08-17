import { useLocalSearchParams } from 'expo-router';

import { isPipeId } from '@/application/navigation/pipes/pipe.config';
import { PipeMenuScreen } from '@/features/pipes/components/PipeMenuScreen';

export default function MenuRoute() {
  const { fromPipe } = useLocalSearchParams<{ fromPipe?: string }>();
  return <PipeMenuScreen fromPipe={isPipeId(fromPipe) ? fromPipe : 'pipe0'} />;
}
