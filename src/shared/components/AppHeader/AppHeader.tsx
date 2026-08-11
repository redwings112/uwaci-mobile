import { Pressable, Text, View } from 'react-native';

import { UwaciLogo } from '@/shared/components/UwaciLogo/UwaciLogo';

interface AppHeaderProps {
  onMenu?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  actionIcon?: string;
  dark?: boolean;
  back?: boolean;
  onBack?: () => void;
}

export function AppHeader({
  onMenu,
  onAction,
  actionLabel = 'Open assistant actions',
  actionIcon = '✧',
  dark = false,
  back = false,
  onBack,
}: AppHeaderProps) {
  return (
    <View className="h-14 flex-row items-center justify-between px-4">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={back ? 'Go back' : 'Open menu'}
        className="h-11 w-11 items-center justify-center"
        onPress={back ? onBack : onMenu}
      >
        <View className="gap-1">
          {back ? (
            <>
              <View className="h-0.5 w-4 rotate-[-45deg] bg-brand" />
              <View className="h-0.5 w-4 rotate-[45deg] bg-brand" />
            </>
          ) : (
            <>
              <View className="h-0.5 w-4 bg-muted" />
              <View className="h-0.5 w-4 bg-muted" />
              <View className="h-0.5 w-4 bg-muted" />
            </>
          )}
        </View>
      </Pressable>
      <UwaciLogo compact dark={dark} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface"
        onPress={onAction}
      >
        {actionIcon === '✧' ? (
          <View className="h-7 w-7 items-center justify-center rounded-full bg-lavender">
            <View className="h-2 w-2 rounded-full bg-brand" />
            <View className="absolute h-5 w-0.5 bg-violet" />
            <View className="absolute h-0.5 w-5 bg-violet" />
          </View>
        ) : (
          <Text className="text-base text-brand">{actionIcon}</Text>
        )}
      </Pressable>
    </View>
  );
}
