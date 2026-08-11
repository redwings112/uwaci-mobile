import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

type AppTab = 'chat' | 'history' | 'saved' | 'discover' | 'profile';

interface BottomTabBarProps {
  active: AppTab;
  profileMode?: boolean;
}

const tabs = {
  chat: { label: 'Chat', icon: '▢', href: '/(app)' },
  history: { label: 'History', icon: '◷', href: '/(app)/history' },
  saved: { label: 'Saved', icon: '⌑', href: '/(app)/saved' },
  discover: { label: 'Discover', icon: '◉', href: '/(app)/discover' },
  profile: { label: 'Profile', icon: '○', href: '/(app)/profile' },
} as const;

export function BottomTabBar({ active, profileMode = false }: BottomTabBarProps) {
  const router = useRouter();
  const visibleTabs: AppTab[] = profileMode
    ? ['chat', 'history', 'saved', 'profile']
    : ['chat', 'history', 'saved', 'discover'];
  return (
    <View className="flex-row border-t border-border bg-surface px-2 pb-2 pt-2 dark:border-white/10 dark:bg-[#17152C]">
      {visibleTabs.map((key) => {
        const tab = tabs[key];
        const selected = key === active;
        return (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected }}
            className="min-h-14 flex-1 items-center justify-center"
            onPress={() => router.push(tab.href)}
          >
            <View
              className={`mb-1 h-0.5 w-8 rounded-full ${selected ? 'bg-brand' : 'bg-transparent'}`}
            />
            <Text className={`text-lg ${selected ? 'text-brand' : 'text-muted'}`}>{tab.icon}</Text>
            <Text className={`text-xs ${selected ? 'font-semibold text-brand' : 'text-muted'}`}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
