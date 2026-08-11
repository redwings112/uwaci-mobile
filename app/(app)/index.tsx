import { useLocalSearchParams } from 'expo-router';
import { HomeScreen } from '@/features/home/components/HomeScreen';

export default function HomeRoute() {
  const params = useLocalSearchParams<{ startRecording?: string }>();
  return <HomeScreen startRecording={params.startRecording === 'true'} />;
}
