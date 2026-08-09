import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';

import { secureStorage } from '@/core/storage/secureStorage';
import { STORAGE_KEYS } from '@/core/storage/storageKeys';
import { Loader } from '@/shared/components/Loader/Loader';

export default function IndexRoute() {
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    void secureStorage.get(STORAGE_KEYS.onboardingComplete).then((value) => {
      if (active) setOnboardingComplete(value === 'true');
    });
    return () => {
      active = false;
    };
  }, []);

  if (onboardingComplete === null) return <Loader fullScreen label="Preparing Uwaci" />;
  return <Redirect href={onboardingComplete ? '/(app)' : '/onboarding'} />;
}
