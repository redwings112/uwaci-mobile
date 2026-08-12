import { useLocalSearchParams } from 'expo-router';
import { HomeScreen } from '@/features/home/components/HomeScreen';

export default function HomeRoute() {
  const params = useLocalSearchParams<{ startRecording?: string; conversationId?: string }>();
  return (
    <HomeScreen
      startRecording={params.startRecording === 'true'}
      {...(params.conversationId ? { conversationId: params.conversationId } : {})}
    />
  );
}
