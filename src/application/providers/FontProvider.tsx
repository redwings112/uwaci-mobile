import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export function FontProvider({ children }: PropsWithChildren) {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const ready = fontsLoaded || fontError != null;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return <View className="flex-1 bg-night" />;
  return children;
}
