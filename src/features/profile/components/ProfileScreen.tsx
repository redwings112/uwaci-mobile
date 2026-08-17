import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type Href, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAuthClient } from '@/core/auth/authClient';
import { clearAuthSession } from '@/core/auth/authSession';
import { secureStorage } from '@/core/storage/secureStorage';
import { STORAGE_KEYS } from '@/core/storage/storageKeys';
import { signedOut } from '@/features/authentication/state/authSlice';
import { getLanguage } from '@/core/constants/languages';
import { AppHeader } from '@/shared/components/AppHeader/AppHeader';
import { AppIcon, type AppIconName } from '@/shared/components/AppIcon/AppIcon';
import { BottomTabBar } from '@/shared/components/BottomTabBar/BottomTabBar';
import { SurfaceCard } from '@/shared/components/SurfaceCard/SurfaceCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/tokens';
import type { PipeId } from '@/application/navigation/pipes/pipe.types';

interface ProfileIdentity {
  name: string;
  email: string;
}

interface ProfileRow {
  icon: AppIconName;
  id: string;
  key: string;
  color: string;
  href?: Href;
}

const groups: readonly { id: string; rows: readonly ProfileRow[] }[] = [
  {
    id: 'account',
    rows: [
      {
        icon: 'user',
        id: 'profile',
        key: '',
        color: colors.brand,
      },
      {
        icon: 'shield',
        id: 'privacy',
        key: '',
        color: colors.success,
        href: '/(app)/privacy',
      },
      {
        icon: 'creditCard',
        id: 'subscription',
        key: '',
        color: colors.cyan,
      },
      {
        icon: 'activity',
        id: 'usage',
        key: '',
        color: colors.accent,
      },
    ],
  },
  {
    id: 'preferences',
    rows: [
      {
        icon: 'globe',
        id: 'language',
        key: 'language',
        color: colors.cyan,
        href: '/(app)/language',
      },
      {
        icon: 'sun',
        id: 'appearance',
        key: 'appearance',
        color: colors.accent,
        href: '/(app)/appearance',
      },
      {
        icon: 'volume',
        id: 'voice',
        key: 'voice',
        color: colors.violet,
        href: '/(app)/settings',
      },
      {
        icon: 'bell',
        id: 'notifications',
        key: '',
        color: colors.success,
      },
    ],
  },
  {
    id: 'more',
    rows: [
      {
        icon: 'help',
        id: 'help',
        key: '',
        color: colors.danger,
      },
      {
        icon: 'info',
        id: 'about',
        key: '',
        color: colors.brand,
      },
    ],
  },
] as const;

export function ProfileScreen({ pipe = 'pipe0' }: { pipe?: PipeId }) {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.language.preferredConversationLanguage);
  const theme = useAppSelector((state) => state.settings.themeMode);
  const [identity, setIdentity] = useState<ProfileIdentity>({
    name: t('profile.defaultName'),
    email: t('profile.guestEmail'),
  });

  useEffect(() => {
    let active = true;
    void getAuthClient()
      ?.auth.getUser()
      .then(({ data }) => {
        if (!active || !data.user) return;
        const email = data.user.email ?? t('profile.privateAccount');
        const metadataName = data.user.user_metadata.full_name;
        const name =
          typeof metadataName === 'string' && metadataName.trim()
            ? metadataName
            : (email.split('@')[0] ?? t('profile.defaultName'));
        setIdentity({ name, email });
      });
    return () => {
      active = false;
    };
  }, [t]);

  const logout = async () => {
    await getAuthClient()?.auth.signOut();
    await Promise.all([clearAuthSession(), secureStorage.remove(STORAGE_KEYS.onboardingComplete)]);
    dispatch(signedOut());
    router.replace('/onboarding');
  };

  const subtitle = (row: ProfileRow) => {
    if (row.key === 'language')
      return t('profile.autoDetect', { language: getLanguage(language).nativeLabel });
    if (row.key === 'appearance')
      return t('profile.themeMode', { mode: `${theme[0]?.toUpperCase()}${theme.slice(1)}` });
    return t(`profile.rows.${row.id}.subtitle`);
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas dark:bg-[#111126]" edges={['top', 'bottom']}>
      <AppHeader actionLabel="Open notifications" actionIcon="bell" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-3 pb-4"
        showsVerticalScrollIndicator={false}
      >
        <SurfaceCard className="flex-row items-center p-4">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-lavender">
            <AppIcon color={colors.brand} name="user" size={30} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-semibold text-ink">{identity.name}</Text>
            <Text className="text-xs text-muted">{identity.email}</Text>
            <View className="mt-1 self-start rounded-full border border-brand/30 px-2 py-0.5">
              <Text className="text-xs text-brand">{t('profile.freePlan')}</Text>
            </View>
          </View>
          <AppIcon color="#777789" name="chevronRight" size={24} />
        </SurfaceCard>
        <SurfaceCard className="mt-3 flex-row items-center p-3">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-brand">
            <AppIcon color="#FFFFFF" name="sparkle" size={25} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-xs font-semibold text-ink">{t('profile.plusTitle')}</Text>
            <Text className="mt-1 text-xs leading-4 text-muted">{t('profile.plusBody')}</Text>
          </View>
          <Pressable className="min-h-9 items-center justify-center rounded-full bg-violet px-4">
            <Text className="text-xs font-semibold text-white">{t('profile.upgrade')}</Text>
          </Pressable>
        </SurfaceCard>

        {groups.map((group) => (
          <View key={group.id} className="mt-3">
            <Text className="mb-2 ml-1 text-xs font-semibold text-muted">
              {t(`profile.groups.${group.id}`)}
            </Text>
            <SurfaceCard className="overflow-hidden">
              {group.rows.map((row, index) => (
                <Pressable
                  key={row.id}
                  accessibilityRole="button"
                  accessibilityLabel={t(`profile.rows.${row.id}.title`)}
                  className={`min-h-16 flex-row items-center px-4 ${index ? 'border-t border-border' : ''}`}
                  onPress={() => {
                    if (row.href) router.push(row.href);
                  }}
                >
                  <View className="w-9">
                    <AppIcon color={row.color} name={row.icon} size={23} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-ink dark:text-white">
                      {t(`profile.rows.${row.id}.title`)}
                    </Text>
                    <Text className="mt-0.5 text-xs leading-4 text-muted">{subtitle(row)}</Text>
                  </View>
                  <AppIcon color="#777789" name="chevronRight" size={22} />
                </Pressable>
              ))}
            </SurfaceCard>
          </View>
        ))}
        <Pressable
          className="mt-3 min-h-11 items-center justify-center rounded-full bg-[#FFF0F2]"
          onPress={() => void logout()}
        >
          <View className="flex-row items-center gap-2">
            <AppIcon color="#D6455D" name="logOut" size={20} />
            <Text className="text-sm font-semibold text-danger">{t('profile.logOut')}</Text>
          </View>
        </Pressable>
      </ScrollView>
      <BottomTabBar active="menu" pipe={pipe} />
    </SafeAreaView>
  );
}
