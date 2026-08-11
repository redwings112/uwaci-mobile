import type { PropsWithChildren } from 'react';
import { View, type ViewProps } from 'react-native';

interface SurfaceCardProps extends ViewProps {
  className?: string;
}

export function SurfaceCard({
  children,
  className = '',
  ...props
}: PropsWithChildren<SurfaceCardProps>) {
  return (
    <View
      className={`rounded-control border border-border bg-surface dark:border-white/10 dark:bg-[#1B1933] ${className}`}
      style={{
        shadowColor: '#322B66',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 14,
        elevation: 2,
      }}
      {...props}
    >
      {children}
    </View>
  );
}
