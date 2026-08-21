import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';

import { bootstrapApp } from '@/application/bootstrap/bootstrapApp';
import { BrandLoadingScreen } from '@/features/onboarding/components/BrandLoadingScreen';

export const BRAND_MOMENT_MS = 2000;

export function LocalizationProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();
    void bootstrapApp()
      .catch(() => undefined)
      .then(() => {
        if (!active) return;
        const remaining = Math.max(0, BRAND_MOMENT_MS - (Date.now() - startedAt));
        timer = setTimeout(() => {
          if (active) setReady(true);
        }, remaining);
      });
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!ready) return <BrandLoadingScreen />;
  return children;
}
