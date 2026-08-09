import type { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthSessionProvider } from './AuthSessionProvider';
import { LocalizationProvider } from './LocalizationProvider';
import { PreferencesProvider } from './PreferencesProvider';
import { ReduxProvider } from './ReduxProvider';
import { ThemeProvider } from './ThemeProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <ReduxProvider>
        <LocalizationProvider>
          <AuthSessionProvider>
            <PreferencesProvider>
              <ThemeProvider>{children}</ThemeProvider>
            </PreferencesProvider>
          </AuthSessionProvider>
        </LocalizationProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  );
}
