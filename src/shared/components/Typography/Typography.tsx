import type { PropsWithChildren } from 'react';
import { Text, type TextProps } from 'react-native';

type Variant = 'display' | 'title' | 'body' | 'label' | 'caption';

interface TypographyProps extends TextProps {
  variant?: Variant;
  className?: string;
}

const variants: Record<Variant, string> = {
  display: 'text-4xl font-bold leading-tight text-ink',
  title: 'text-2xl font-bold leading-8 text-ink',
  body: 'text-base leading-6 text-ink',
  label: 'text-sm font-semibold leading-5 text-ink',
  caption: 'text-xs leading-4 text-muted',
};

export function Typography({
  children,
  variant = 'body',
  className = '',
  ...props
}: PropsWithChildren<TypographyProps>) {
  return (
    <Text className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </Text>
  );
}
