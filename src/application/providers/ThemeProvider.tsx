import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

import { useAppSelector } from '@/store/hooks';

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const themeMode = useAppSelector((state) => state.settings.themeMode);
  const dark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

  useEffect(() => {
    setColorScheme(themeMode);
  }, [setColorScheme, themeMode]);
  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      {children}
    </>
  );
}
