import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';

import { secureStorage } from '@/core/storage/secureStorage';
import { STORAGE_KEYS } from '@/core/storage/storageKeys';
import { BrandLoadingScreen } from '@/features/onboarding/components/BrandLoadingScreen';

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

  if (onboardingComplete === null) return <BrandLoadingScreen />;
  return <Redirect href={onboardingComplete ? '/(app)' : '/onboarding'} />;
}
