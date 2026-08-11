import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAuthClient } from '@/core/auth/authClient';
import { clearAuthSession } from '@/core/auth/authSession';
import { secureStorage } from '@/core/storage/secureStorage';
import { STORAGE_KEYS } from '@/core/storage/storageKeys';
import { signedOut } from '@/features/authentication/state/authSlice';
import { getLanguage } from '@/core/constants/languages';
import { AppHeader } from '@/shared/components/AppHeader/AppHeader';
import { BottomTabBar } from '@/shared/components/BottomTabBar/BottomTabBar';
import { SurfaceCard } from '@/shared/components/SurfaceCard/SurfaceCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

interface ProfileIdentity {
  name: string;
  email: string;
}

const groups = [
  {
    label: 'Account',
    rows: [
      ['♙', 'Profile', 'View and edit your information', ''],
      ['♢', 'Privacy & Security', 'Manage your data and privacy', ''],
      ['▣', 'Subscription', 'Manage your plan and billing', ''],
      ['◷', 'Usage', 'See your activity and daily limits', ''],
    ],
  },
  {
    label: 'Preferences',
    rows: [
      ['◎', 'Language', 'Conversation language', 'language'],
      ['☼', 'Appearance', 'Choose how Uwaci looks and feels', 'appearance'],
      ['◖', 'Voice & Speech', 'Select voice and speech speed', 'voice'],
      ['♧', 'Notifications', 'Manage your alerts and updates', ''],
    ],
  },
  {
    label: 'More',
    rows: [
      ['?', 'Help & Support', 'FAQs, guides and contact us', ''],
      ['ⓘ', 'About Uwaci', 'Version 1.0.0', ''],
    ],
  },
] as const;

export function ProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.language.preferredConversationLanguage);
  const theme = useAppSelector((state) => state.settings.themeMode);
  const [identity, setIdentity] = useState<ProfileIdentity>({
    name: 'Uwaci User',
    email: 'Private guest session',
  });

  useEffect(() => {
    let active = true;
    void getAuthClient()
      ?.auth.getUser()
      .then(({ data }) => {
        if (!active || !data.user) return;
        const email = data.user.email ?? 'Private account';
        const metadataName = data.user.user_metadata.full_name;
        const name =
          typeof metadataName === 'string' && metadataName.trim()
            ? metadataName
            : (email.split('@')[0] ?? 'Uwaci User');
        setIdentity({ name, email });
      });
    return () => {
      active = false;
    };
  }, []);

  const logout = async () => {
    await getAuthClient()?.auth.signOut();
    await Promise.all([clearAuthSession(), secureStorage.remove(STORAGE_KEYS.onboardingComplete)]);
    dispatch(signedOut());
    router.replace('/onboarding');
  };

  const subtitle = (key: string, fallback: string) => {
    if (key === 'language') return `Auto-detect · ${getLanguage(language).nativeLabel}`;
    if (key === 'appearance') return `${theme[0]?.toUpperCase()}${theme.slice(1)} mode`;
    return fallback;
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas dark:bg-[#111126]" edges={['top', 'bottom']}>
      <AppHeader actionLabel="Notifications" actionIcon="♧" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-3 pb-4"
        showsVerticalScrollIndicator={false}
      >
        <SurfaceCard className="flex-row items-center p-4">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-lavender">
            <Text className="text-2xl text-brand">♙</Text>
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-semibold text-ink">{identity.name}</Text>
            <Text className="text-xs text-muted">{identity.email}</Text>
            <View className="mt-1 self-start rounded-full border border-brand/30 px-2 py-0.5">
              <Text className="text-xs text-brand">Free plan</Text>
            </View>
          </View>
          <Text className="text-muted">›</Text>
        </SurfaceCard>
        <SurfaceCard className="mt-3 flex-row items-center p-3">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-brand">
            <Text className="text-xl text-white">✦</Text>
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-xs font-semibold text-ink">Unlock more with Uwaci Plus</Text>
            <Text className="mt-1 text-xs leading-4 text-muted">
              More daily usage, faster answers, file uploads, and advanced features.
            </Text>
          </View>
          <Pressable className="min-h-9 items-center justify-center rounded-full bg-violet px-4">
            <Text className="text-xs font-semibold text-white">Upgrade</Text>
          </Pressable>
        </SurfaceCard>

        {groups.map((group) => (
          <View key={group.label} className="mt-3">
            <Text className="mb-2 ml-1 text-xs font-semibold text-muted">{group.label}</Text>
            <SurfaceCard className="overflow-hidden">
              {group.rows.map(([icon, title, fallback, key], index) => (
                <Pressable
                  key={title}
                  accessibilityRole="button"
                  className={`min-h-16 flex-row items-center px-4 ${index ? 'border-t border-border' : ''}`}
                  onPress={() => {
                    if (key === 'appearance') router.push('/(app)/appearance');
                  }}
                >
                  <Text className={`w-7 text-base ${index % 2 ? 'text-cyan' : 'text-violet'}`}>
                    {icon}
                  </Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-ink dark:text-white">{title}</Text>
                    <Text className="mt-0.5 text-xs leading-4 text-muted">
                      {subtitle(key, fallback)}
                    </Text>
                  </View>
                  <Text className="text-muted">›</Text>
                </Pressable>
              ))}
            </SurfaceCard>
          </View>
        ))}
        <Pressable
          className="mt-3 min-h-11 items-center justify-center rounded-full bg-[#FFF0F2]"
          onPress={() => void logout()}
        >
          <Text className="text-xs font-semibold text-danger">⇥ Log out</Text>
        </Pressable>
      </ScrollView>
      <BottomTabBar active="profile" profileMode />
    </SafeAreaView>
  );
}
