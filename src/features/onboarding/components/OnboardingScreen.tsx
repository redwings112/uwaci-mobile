import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import type { MicrophonePermission } from '@/core/audio/audioTypes';
import { requestMicrophonePermission } from '@/core/audio/audioPermissions';
import { secureStorage } from '@/core/storage/secureStorage';
import { STORAGE_KEYS } from '@/core/storage/storageKeys';
import { LanguageSelector } from '@/features/language/components/LanguageSelector';
import { preferredLanguageChanged } from '@/features/language/state/languageSlice';
import { selectPreferredLanguage } from '@/features/language/state/selectors';
import { Button } from '@/shared/components/Button/Button';
import { Screen } from '@/shared/components/Screen/Screen';
import { Typography } from '@/shared/components/Typography/Typography';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

type OnboardingStep = 'welcome' | 'language' | 'microphone';

export function OnboardingScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectPreferredLanguage);
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [permission, setPermission] = useState<MicrophonePermission>('undetermined');
  const [requestingPermission, setRequestingPermission] = useState(false);

  const finish = async () => {
    await secureStorage.set(STORAGE_KEYS.onboardingComplete, 'true');
    router.replace('/(app)');
  };

  const enableMicrophone = async () => {
    setRequestingPermission(true);
    try {
      const result = await requestMicrophonePermission();
      setPermission(result);
      if (result === 'granted') await finish();
    } finally {
      setRequestingPermission(false);
    }
  };

  return (
    <Screen scroll className="justify-between pb-8">
      <View>
        <View className="mb-10 flex-row items-center justify-between">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-ink">
            <Typography variant="title" className="text-white">
              U
            </Typography>
          </View>
          <Typography variant="caption">
            {step === 'welcome' ? '1' : step === 'language' ? '2' : '3'} of 3
          </Typography>
        </View>

        {step === 'welcome' ? (
          <View className="gap-5">
            <Typography variant="label" className="text-brand">
              YOUR VOICE, UNDERSTOOD
            </Typography>
            <Typography variant="display">Talk naturally. Uwaci will meet you there.</Typography>
            <Typography className="text-lg leading-7 text-muted">
              Ask by voice or text, mix languages, and continue the same conversation without
              starting over.
            </Typography>
            <View className="gap-2 rounded-card border border-border bg-surface p-5">
              <Typography variant="label">Your voice stays under your control</Typography>
              <Typography className="text-muted">
                Recordings are sent securely only when you choose to speak and are not silently kept
                for training.
              </Typography>
            </View>
          </View>
        ) : null}

        {step === 'language' ? (
          <View className="gap-5">
            <Typography variant="label" className="text-brand">
              CONVERSATION LANGUAGE
            </Typography>
            <Typography variant="display">Choose a starting language.</Typography>
            <Typography className="text-lg leading-7 text-muted">
              This guides the response, but you can still switch or mix languages naturally.
            </Typography>
            <LanguageSelector
              value={language}
              onChange={(value) => dispatch(preferredLanguageChanged(value))}
            />
            <Typography variant="caption">
              Lingala and Swahili transcription and device voices are experimental for this MVP.
            </Typography>
          </View>
        ) : null}

        {step === 'microphone' ? (
          <View className="gap-5">
            <View className="h-28 w-28 items-center justify-center self-center rounded-full bg-brand/10">
              <View className="h-20 w-20 items-center justify-center rounded-full bg-brand">
                <Typography className="text-4xl text-white">●</Typography>
              </View>
            </View>
            <Typography variant="display" className="text-center">
              Speak only when you choose.
            </Typography>
            <Typography className="text-center text-lg leading-7 text-muted">
              Uwaci needs microphone access to record a question. You can always type instead.
            </Typography>
            {permission === 'denied' ? (
              <View
                className="rounded-card border border-danger bg-red-50 p-4"
                accessibilityRole="alert"
              >
                <Typography variant="label" className="text-danger">
                  Microphone permission is blocked
                </Typography>
                <Typography className="mt-1 text-muted">
                  You can continue with text and enable microphone access later in Android settings.
                </Typography>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      <View className="mt-12 gap-3">
        {step === 'welcome' ? <Button onPress={() => setStep('language')}>Continue</Button> : null}
        {step === 'language' ? (
          <>
            <Button onPress={() => setStep('microphone')}>Use {language.toUpperCase()}</Button>
            <Button variant="ghost" onPress={() => setStep('welcome')}>
              Back
            </Button>
          </>
        ) : null}
        {step === 'microphone' ? (
          <>
            <Button loading={requestingPermission} onPress={() => void enableMicrophone()}>
              Enable microphone
            </Button>
            <Button variant="secondary" onPress={() => void finish()}>
              Not now — I’ll type
            </Button>
            <Button variant="ghost" onPress={() => setStep('language')}>
              Back
            </Button>
          </>
        ) : null}
      </View>
    </Screen>
  );
}
