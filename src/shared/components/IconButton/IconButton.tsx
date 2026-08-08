import { Pressable, type PressableProps, Text } from 'react-native';

interface IconButtonProps extends PressableProps {
  label: string;
  icon: string;
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
      <Text className="text-xl" importantForAccessibility="no">
        {icon}
      </Text>
    </Pressable>
  );
}
