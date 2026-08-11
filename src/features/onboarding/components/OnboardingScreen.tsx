import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { secureStorage } from '@/core/storage/secureStorage';
import { STORAGE_KEYS } from '@/core/storage/storageKeys';
import { LanguageSelector } from '@/features/language/components/LanguageSelector';
import { preferredLanguageChanged } from '@/features/language/state/languageSlice';
import { selectPreferredLanguage } from '@/features/language/state/selectors';
import { AppHeader } from '@/shared/components/AppHeader/AppHeader';
import { UwaciLogo } from '@/shared/components/UwaciLogo/UwaciLogo';
import { Typography } from '@/shared/components/Typography/Typography';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

function ActionCard({
  icon,
  title,
  subtitle,
  tone,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  tone: 'blue' | 'violet';
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`mb-3 flex-row items-center rounded-control border ${tone === 'blue' ? 'border-brand/60' : 'border-fuchsia/60'} bg-[#09091A] px-4 py-3`}
      onPress={onPress}
    >
      <View
        className={`h-11 w-11 items-center justify-center rounded-full ${tone === 'blue' ? 'bg-brand/20' : 'bg-fuchsia/20'}`}
      >
        <Text className={`text-xl ${tone === 'blue' ? 'text-brand' : 'text-fuchsia'}`}>{icon}</Text>
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-sm font-semibold text-white">{title}</Text>
        <Text className="mt-0.5 text-[10px] text-white/60">{subtitle}</Text>
      </View>
      <Text className="text-xl text-violet">›</Text>
    </Pressable>
  );
}

export function OnboardingScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectPreferredLanguage);
  const [showLanguage, setShowLanguage] = useState(false);

  const startVoice = async () => {
    await secureStorage.set(STORAGE_KEYS.onboardingComplete, 'true');
    // The permission prompt belongs to the listening experience. Keeping the
    // route transition first gives users the same recovery path as returning
    // users and lets a denial fall back to text without losing context.
    router.replace({ pathname: '/(app)', params: { startRecording: 'true' } });
  };

  if (showLanguage) {
    return (
      <View className="flex-1 bg-canvas dark:bg-[#111126]">
        <AppHeader back onBack={() => setShowLanguage(false)} />
        <View className="flex-1 px-5 pt-6">
          <Typography variant="title">Choose your language</Typography>
          <Typography className="mt-2 text-muted">
            Your conversation language can change any time.
          </Typography>
          <View className="mt-6">
            <LanguageSelector
              value={language}
              onChange={(value) => dispatch(preferredLanguageChanged(value))}
            />
          </View>
          <Pressable
            className="mt-8 min-h-12 items-center justify-center rounded-control bg-brand"
            onPress={() => setShowLanguage(false)}
          >
            <Text className="font-semibold text-white">Continue</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#01020A] px-4">
      <View className="flex-1 justify-between pb-5 pt-12">
        <View className="items-center">
          <View className="h-40 w-40 items-center justify-center">
            <View className="absolute h-32 w-32 rounded-full border-2 border-brand/40" />
            <View className="absolute h-24 w-24 rounded-full border border-fuchsia/50" />
            <Text className="text-8xl font-bold text-brand">U</Text>
            <View className="absolute top-1 h-5 w-5 rounded-full bg-accent" />
          </View>
          <UwaciLogo dark />
          <Text className="mt-2 text-[9px] font-semibold tracking-[3px] text-accent">
            KNOWLEDGE FOR HUMANITY
          </Text>
          <Text className="mt-8 text-center text-xl font-semibold text-white">
            Welcome to <Text className="text-violet">Uwaci</Text>
          </Text>
          <Text className="mt-2 text-center text-[13px] leading-5 text-white/80">
            Digitize, update, and use{`\n`}your realities on your own terms.
          </Text>
        </View>

        <View>
          <ActionCard
            icon="◌"
            title="Speak to Uwaci"
            subtitle="Tap and start speaking"
            tone="blue"
            onPress={() => void startVoice()}
          />
          <ActionCard
            icon="▦"
            title="Type to Uwaci"
            subtitle="Chat using text"
            tone="violet"
            onPress={() => {
              void secureStorage.set(STORAGE_KEYS.onboardingComplete, 'true');
              router.replace({
                pathname: '/(app)/conversation/[conversationId]',
                params: { conversationId: `new-${Date.now()}`, focusComposer: 'true' },
              });
            }}
          />
          <View className="my-2 flex-row items-center justify-center">
            <View className="h-px flex-1 bg-white/10" />
            <Text className="mx-3 text-[10px] text-white/50">OR</Text>
            <View className="h-px flex-1 bg-white/10" />
          </View>
          <View className="flex-row items-center justify-center">
            <Pressable
              className="min-h-12 flex-1 items-center justify-center"
              onPress={() => router.push('/(auth)/sign-in')}
            >
              <Text className="text-xs text-white">♙ Sign In</Text>
            </Pressable>
            <View className="h-6 w-px bg-white/20" />
            <Pressable
              className="min-h-12 flex-1 items-center justify-center"
              onPress={() => router.push('/(auth)/sign-up')}
            >
              <Text className="text-xs text-white">♙ Create Account</Text>
            </Pressable>
          </View>
          <Text className="mt-2 text-center text-[9px] text-white/50">
            By continuing, you agree to our{`\n`}
            <Text className="text-brand">Terms of Service</Text> and{' '}
            <Text className="text-violet">Privacy Policy</Text>
          </Text>
          <Pressable className="mt-3 self-center" onPress={() => setShowLanguage(true)}>
            <Text className="text-[10px] text-white/50">Language: {language.toUpperCase()}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
