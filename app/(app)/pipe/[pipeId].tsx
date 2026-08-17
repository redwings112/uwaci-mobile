import { Redirect, useLocalSearchParams } from 'expo-router';

import { isPipeId } from '@/application/navigation/pipes/pipe.config';
import { PipeContextScreen } from '@/features/pipes/components/PipeContextScreen';

export default function PipeRoute() {
  const { pipeId } = useLocalSearchParams<{ pipeId?: string }>();
  if (!isPipeId(pipeId) || pipeId === 'pipe0') return <Redirect href="/(app)" />;
  return <PipeContextScreen pipe={pipeId} />;
}
