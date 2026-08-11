import { useLocalSearchParams } from 'expo-router';

import { AuthScreen } from '@/features/authentication/components/AuthScreen';

export default function SignInRoute() {
  const params = useLocalSearchParams<{ next?: string; conversationId?: string }>();
  return (
    <AuthScreen
      mode="sign-in"
      {...(params.next === 'voice' || params.next === 'text' ? { next: params.next } : {})}
      {...(typeof params.conversationId === 'string'
        ? { conversationId: params.conversationId }
        : {})}
    />
  );
}
