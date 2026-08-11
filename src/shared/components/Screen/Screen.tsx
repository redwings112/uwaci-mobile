import type { PropsWithChildren } from 'react';
import { ScrollView, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps extends ViewProps {
  scroll?: boolean;
  className?: string;
}

export function Screen({
  children,
  scroll = false,
  className = '',
  ...props
}: PropsWithChildren<ScreenProps>) {
  const content = scroll ? (
    <ScrollView
      contentContainerClassName={`grow px-5 py-4 ${className}`}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 px-5 py-4 ${className}`} {...props}>
      {children}
    </View>
  );
  return (
    <SafeAreaView className="flex-1 bg-canvas dark:bg-[#111126]" edges={['top', 'bottom']}>
      {content}
    </SafeAreaView>
  );
}
