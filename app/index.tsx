import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { Image, View } from 'react-native';

import { secureStorage } from '@/core/storage/secureStorage';
import { STORAGE_KEYS } from '@/core/storage/storageKeys';

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

  if (onboardingComplete === null)
    return (
      <View
        className="flex-1 bg-black"
        accessibilityLabel="Preparing Uwaci"
        accessibilityRole="progressbar"
      >
        <Image
          className="h-full w-full"
          resizeMode="cover"
          source={require('../assets/splash-icon.png')}
        />
      </View>
    );
  return <Redirect href={onboardingComplete ? '/(app)' : '/onboarding'} />;
}
