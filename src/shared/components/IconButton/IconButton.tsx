import { Pressable, type PressableProps } from 'react-native';

import { AppIcon, type AppIconName } from '@/shared/components/AppIcon/AppIcon';
import { colors } from '@/theme/tokens';

interface IconButtonProps extends PressableProps {
  label: string;
  icon: AppIconName;
  className?: string;
}

export function IconButton({ label, icon, className = '', ...props }: IconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      className={`h-12 w-12 items-center justify-center rounded-full ${className}`}
      {...props}
    >
      <AppIcon color={colors.brand} name={icon} size={27} />
    </Pressable>
  );
}
