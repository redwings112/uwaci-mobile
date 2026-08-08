import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';

import { Typography } from '@/shared/components/Typography/Typography';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  loading?: boolean;
  className?: string;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand',
  secondary: 'border border-border bg-surface',
  ghost: 'bg-transparent',
  danger: 'bg-danger',
};

export function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  ...props
}: PropsWithChildren<ButtonProps>) {
  const lightText = variant === 'primary' || variant === 'danger';
  return (
    <Pressable
      accessibilityRole="button"
      className={`min-h-12 items-center justify-center rounded-control px-5 py-3 ${variants[variant]} ${className} ${disabled || loading ? 'opacity-50' : ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={lightText ? '#FFFFFF' : '#215C45'} />
      ) : (
        <Typography variant="label" className={lightText ? 'text-white' : 'text-ink'}>
          {children}
        </Typography>
      )}
    </Pressable>
  );
}
