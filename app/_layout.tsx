import '../global.css';

import { Stack } from 'expo-router';

import { AppProviders } from '@/application/providers/AppProviders';

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
    </AppProviders>
  );
}
