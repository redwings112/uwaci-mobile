import type { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthSessionProvider } from './AuthSessionProvider';
import { LocalizationProvider } from './LocalizationProvider';
import { NetworkProvider } from './NetworkProvider';
import { PreferencesProvider } from './PreferencesProvider';
import { ReduxProvider } from './ReduxProvider';
import { ThemeProvider } from './ThemeProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <ReduxProvider>
        <LocalizationProvider>
          <AuthSessionProvider>
            <NetworkProvider>
              <PreferencesProvider>
                <ThemeProvider>{children}</ThemeProvider>
              </PreferencesProvider>
            </NetworkProvider>
          </AuthSessionProvider>
        </LocalizationProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  );
}
