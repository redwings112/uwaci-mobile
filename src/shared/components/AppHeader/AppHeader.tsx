import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/shared/components/AppIcon/AppIcon';
import { UwaciLogo } from '@/shared/components/UwaciLogo/UwaciLogo';
import { colors } from '@/theme/tokens';

interface AppHeaderProps {
  onAction?: () => void;
  actionLabel?: string;
  actionIcon?: AppIconName;
  dark?: boolean;
  back?: boolean;
  tagline?: boolean;
  onBack?: () => void;
}

export function AppHeader({
  onAction,
  actionLabel = 'Open assistant actions',
  actionIcon = 'sparkle',
  dark = false,
  back = false,
  tagline = false,
  onBack,
}: AppHeaderProps) {
  const router = useRouter();
  const openProfile = () => router.push('/(app)/profile');
  const openChat = () =>
    router.push({
      pathname: '/(app)/conversation/[conversationId]',
      params: { conversationId: 'new' },
    });

  return (
    <View className="h-16 flex-row items-center justify-between bg-canvas px-4 dark:bg-[#111126]">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={back ? 'Go back' : 'Open account and settings'}
        className="h-12 w-12 items-center justify-center"
        onPress={back ? onBack : openProfile}
      >
        <AppIcon
          color={colors.brand}
          name={back ? 'arrowLeft' : 'profile'}
          size={28}
        />
      </Pressable>
      <UwaciLogo compact dark={dark} tagline={tagline} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        className="h-12 w-12 items-center justify-center rounded-full border border-border bg-surface dark:border-white/10 dark:bg-[#1B1933]"
        onPress={onAction ?? (actionIcon === 'sparkle' ? openChat : undefined)}
      >
        <AppIcon color={colors.brand} name={actionIcon} size={25} />
      </Pressable>
    </View>
  );
}
