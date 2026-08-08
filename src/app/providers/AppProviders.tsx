import type { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LocalizationProvider } from './LocalizationProvider';
import { ReduxProvider } from './ReduxProvider';
import { ThemeProvider } from './ThemeProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <ReduxProvider>
        <LocalizationProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </LocalizationProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  );
}
