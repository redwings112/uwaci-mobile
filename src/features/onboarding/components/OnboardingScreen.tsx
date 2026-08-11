import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { secureStorage } from '@/core/storage/secureStorage';
import { ensureAuthSession } from '@/core/auth/authSession';
import { STORAGE_KEYS } from '@/core/storage/storageKeys';
import { LanguageSelector } from '@/features/language/components/LanguageSelector';
import { preferredLanguageChanged } from '@/features/language/state/languageSlice';
import { selectPreferredLanguage } from '@/features/language/state/selectors';
import { AppHeader } from '@/shared/components/AppHeader/AppHeader';
import { AppIcon, type AppIconName } from '@/shared/components/AppIcon/AppIcon';
import { Typography } from '@/shared/components/Typography/Typography';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

function ActionCard({
  icon,
  title,
  subtitle,
  tone,
  onPress,
}: {
  icon: AppIconName;
  title: string;
  subtitle: string;
  tone: 'blue' | 'violet';
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`mb-4 min-h-20 flex-row items-center rounded-control border ${tone === 'blue' ? 'border-brand/60' : 'border-fuchsia/60'} bg-[#09091A] px-5 py-4`}
      onPress={onPress}
    >
      <View
        className={`h-14 w-14 items-center justify-center rounded-full ${tone === 'blue' ? 'bg-brand/20' : 'bg-fuchsia/20'}`}
      >
        <AppIcon color={tone === 'blue' ? '#4AA9FF' : '#C43BE4'} name={icon} size={30} />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-base font-semibold text-white">{title}</Text>
        <Text className="mt-1 text-xs text-white/60">{subtitle}</Text>
      </View>
      <AppIcon color="#8B5CF6" name="chevronRight" size={26} />
    </Pressable>
  );
}

export function OnboardingScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectPreferredLanguage);
  const [showLanguage, setShowLanguage] = useState(false);

  const openChat = async (next: 'voice' | 'text') => {
    try {
      await ensureAuthSession();
      await secureStorage.set(STORAGE_KEYS.onboardingComplete, 'true');
      if (next === 'voice') {
        router.replace({ pathname: '/(app)', params: { startRecording: 'true' } });
      } else {
        router.replace({
          pathname: '/(app)/conversation/[conversationId]',
          params: { conversationId: 'new', focusComposer: 'true' },
        });
      }
    } catch {
      router.push({ pathname: '/(auth)/sign-in', params: { next } });
    }
  };

  if (showLanguage) {
    return (
      <SafeAreaView className="flex-1 bg-canvas dark:bg-[#111126]" edges={['top', 'bottom']}>
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#01020A] px-4" edges={['top', 'bottom']}>
      <View className="flex-1 justify-between pb-5 pt-12">
        <View className="items-center">
          <Image
            accessibilityLabel="Uwaci logo"
            className="h-52 w-52"
            resizeMode="contain"
            source={require('../../../../assets/logo.png')}
          />
          <Text className="text-4xl font-semibold tracking-[6px] text-white">Uwaci</Text>
          <Text className="mt-2 text-xs font-semibold tracking-[3px] text-accent">
            KNOWLEDGE FOR HUMANITY
          </Text>
          <Text className="mt-7 text-center text-2xl font-semibold text-white">
            Welcome to <Text className="text-violet">Uwaci</Text>
          </Text>
          <Text className="mt-3 text-center text-base leading-6 text-white/80">
            Digitize, update, and use{`\n`}your realities on your own terms.
          </Text>
        </View>

        <View>
          <ActionCard
            icon="mic"
            title="Speak to Uwaci"
            subtitle="Tap and start speaking"
            tone="blue"
            onPress={() => void openChat('voice')}
          />
          <ActionCard
            icon="keyboard"
            title="Type to Uwaci"
            subtitle="Chat using text"
            tone="violet"
            onPress={() => void openChat('text')}
          />
          <View className="my-2 flex-row items-center justify-center">
            <View className="h-px flex-1 bg-white/10" />
            <Text className="mx-3 text-xs text-white/50">OR</Text>
            <View className="h-px flex-1 bg-white/10" />
          </View>
          <View className="flex-row items-center justify-center">
            <Pressable
              className="min-h-12 flex-1 items-center justify-center"
              onPress={() => router.push('/(auth)/sign-in')}
            >
              <View className="flex-row items-center gap-2">
                <AppIcon color="#FFFFFF" name="logIn" size={20} />
                <Text className="text-sm text-white">Sign In</Text>
              </View>
            </Pressable>
            <View className="h-6 w-px bg-white/20" />
            <Pressable
              className="min-h-12 flex-1 items-center justify-center"
              onPress={() => router.push('/(auth)/sign-up')}
            >
              <View className="flex-row items-center gap-2">
                <AppIcon color="#FFFFFF" name="userPlus" size={20} />
                <Text className="text-sm text-white">Create Account</Text>
              </View>
            </Pressable>
          </View>
          <Text className="mt-3 text-center text-xs leading-5 text-white/50">
            By continuing, you agree to our{`\n`}
            <Text className="text-brand">Terms of Service</Text> and{' '}
            <Text className="text-violet">Privacy Policy</Text>
          </Text>
          <Pressable className="mt-3 self-center" onPress={() => setShowLanguage(true)}>
            <Text className="text-xs text-white/50">Language: {language.toUpperCase()}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
