import { type Href, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/shared/components/AppIcon/AppIcon';
import { SpeechControlBar } from '@/shared/components/SpeechControlBar/SpeechControlBar';

type AppTab = 'chat' | 'history' | 'saved' | 'discover' | 'profile';

interface BottomTabBarProps {
  active: AppTab;
  profileMode?: boolean;
  showSpeechControls?: boolean;
}

const tabs: Record<AppTab, { label: string; icon: AppIconName; href: Href }> = {
  chat: { label: 'Chat', icon: 'message', href: '/(app)' },
  history: { label: 'History', icon: 'history', href: '/(app)/history' },
  saved: { label: 'Saved', icon: 'bookmark', href: '/(app)/saved' },
  discover: { label: 'Discover', icon: 'compass', href: '/(app)/discover' },
  profile: { label: 'Profile', icon: 'profile', href: '/(app)/profile' },
};

export function BottomTabBar({
  active,
  profileMode = false,
  showSpeechControls = true,
}: BottomTabBarProps) {
  const router = useRouter();
  const visibleTabs: AppTab[] = profileMode
    ? ['chat', 'history', 'saved', 'profile']
    : ['chat', 'history', 'saved', 'discover'];
  return (
    <View>
      {showSpeechControls ? <SpeechControlBar /> : null}
      <View className="flex-row border-t border-border bg-surface px-1 pb-2 pt-1 dark:border-white/10 dark:bg-[#17152C]">
        {visibleTabs.map((key) => {
          const tab = tabs[key];
          const selected = key === active;
          return (
            <Pressable
              key={key}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected }}
              className="min-h-16 flex-1 items-center justify-center rounded-xl"
              onPress={() => router.push(tab.href)}
            >
              <View
                className={`mb-1 h-1 w-10 rounded-full ${selected ? 'bg-brand' : 'bg-transparent'}`}
              />
              <AppIcon
                color={selected ? '#215C45' : '#777789'}
                name={tab.icon}
                size={27}
                strokeWidth={selected ? 2.5 : 2}
              />
              <Text
                className={`mt-1 text-xs ${selected ? 'font-semibold text-brand' : 'text-muted'}`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
