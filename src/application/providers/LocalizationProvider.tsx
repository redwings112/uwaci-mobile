import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';

import { bootstrapApp } from '@/application/bootstrap/bootstrapApp';
import { Loader } from '@/shared/components/Loader/Loader';

export function LocalizationProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void bootstrapApp().then(() => setReady(true));
  }, []);

  if (!ready) return <Loader fullScreen label="Preparing Uwaci" />;
  return children;
}
