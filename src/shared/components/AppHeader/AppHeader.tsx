import { Pressable, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/shared/components/AppIcon/AppIcon';
import { UwaciLogo } from '@/shared/components/UwaciLogo/UwaciLogo';

interface AppHeaderProps {
  onMenu?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  actionIcon?: AppIconName;
  dark?: boolean;
  back?: boolean;
  onBack?: () => void;
}

export function AppHeader({
  onMenu,
  onAction,
  actionLabel = 'Open assistant actions',
  actionIcon = 'sparkle',
  dark = false,
  back = false,
  onBack,
}: AppHeaderProps) {
  return (
    <View className="h-16 flex-row items-center justify-between bg-canvas px-4 dark:bg-[#111126]">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={back ? 'Go back' : 'Open menu'}
        className="h-12 w-12 items-center justify-center"
        onPress={back ? onBack : onMenu}
      >
        <AppIcon
          color={back ? '#215C45' : '#777789'}
          name={back ? 'arrowLeft' : 'menu'}
          size={28}
        />
      </Pressable>
      <UwaciLogo compact dark={dark} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        className="h-12 w-12 items-center justify-center rounded-full border border-border bg-surface dark:border-white/10 dark:bg-[#1B1933]"
        onPress={onAction}
      >
        <AppIcon color="#215C45" name={actionIcon} size={25} />
      </Pressable>
    </View>
  );
}
