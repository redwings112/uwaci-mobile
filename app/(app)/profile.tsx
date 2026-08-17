import { useLocalSearchParams } from 'expo-router';

import { isPipeId } from '@/application/navigation/pipes/pipe.config';
import { ProfileScreen } from '@/features/profile/components/ProfileScreen';

export default function ProfileRoute() {
  const { fromPipe } = useLocalSearchParams<{ fromPipe?: string }>();
  return <ProfileScreen pipe={isPipeId(fromPipe) ? fromPipe : 'pipe0'} />;
}
