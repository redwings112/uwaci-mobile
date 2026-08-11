import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/shared/components/AppHeader/AppHeader';
import { BottomTabBar } from '@/shared/components/BottomTabBar/BottomTabBar';
import { SurfaceCard } from '@/shared/components/SurfaceCard/SurfaceCard';
import { Typography } from '@/shared/components/Typography/Typography';

type LibraryTab = 'history' | 'saved' | 'discover';

const copy: Record<LibraryTab, { title: string; message: string; icon: string }> = {
  history: {
    title: 'Conversation history',
    message:
      'Your current conversations remain available while you use them. Server-synced history will appear here when the conversation-list API is available.',
    icon: '◷',
  },
  saved: {
    title: 'Saved answers',
    message: 'Save and organize answers here once the backend exposes bookmark support.',
    icon: '⌑',
  },
  discover: {
    title: 'Discover with Uwaci',
    message:
      'Explore guided ideas and learning prompts. Personalized discovery is not connected to the backend yet.',
    icon: '◉',
  },
};

export function LibraryPlaceholderScreen({ tab }: { tab: LibraryTab }) {
  const router = useRouter();
  const content = copy[tab];
  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <AppHeader onMenu={() => router.push('/(app)/profile')} />
      <View className="flex-1 px-4 pt-8">
        <SurfaceCard className="items-center p-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-lavender">
            <Text className="text-3xl text-brand">{content.icon}</Text>
          </View>
          <Typography variant="title" className="mt-5 text-center">
            {content.title}
          </Typography>
          <Typography className="mt-3 text-center text-muted">{content.message}</Typography>
          <Pressable
            className="mt-6 min-h-11 items-center justify-center rounded-full bg-brand px-6"
            onPress={() => router.push('/(app)')}
          >
            <Text className="text-xs font-semibold text-white">Start a new chat</Text>
          </Pressable>
        </SurfaceCard>
      </View>
      <BottomTabBar active={tab} />
    </SafeAreaView>
  );
}
