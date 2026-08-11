import type { PropsWithChildren } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { useAppSelector } from '@/store/hooks';

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const themeMode = useAppSelector((state) => state.settings.themeMode);
  const dark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');
  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      {children}
    </>
  );
}
