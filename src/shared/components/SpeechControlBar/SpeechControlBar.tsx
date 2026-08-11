import { Platform, Pressable, Text, View } from 'react-native';

import { speechService } from '@/core/speech/speechService';
import { useSpeechPlayback } from '@/core/speech/useSpeechPlayback';
import { AppIcon } from '@/shared/components/AppIcon/AppIcon';

export function SpeechControlBar() {
  const playback = useSpeechPlayback();
  if (playback.status === 'idle') return null;

  const paused = playback.status === 'paused';
  return (
    <View
      className="flex-row items-center border-t border-brand/20 bg-lavender px-4 py-2 dark:bg-[#24213F]"
      accessibilityLiveRegion="polite"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-brand">
        <AppIcon color="#FFFFFF" name="volume" size={22} />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-sm font-semibold text-ink dark:text-white">
          {paused ? 'Spoken answer paused' : 'Uwaci is speaking'}
        </Text>
        <Text className="mt-0.5 text-xs text-muted">Playback stays available across screens.</Text>
      </View>
      {Platform.OS !== 'android' ? (
        <Pressable
          accessibilityLabel={paused ? 'Resume spoken answer' : 'Pause spoken answer'}
          accessibilityRole="button"
          className="h-11 w-11 items-center justify-center rounded-full"
          onPress={() => void (paused ? speechService.resume() : speechService.pause())}
        >
          <AppIcon color="#215C45" name={paused ? 'play' : 'pause'} size={25} />
        </Pressable>
      ) : null}
      <Pressable
        accessibilityLabel="Stop spoken answer"
        accessibilityRole="button"
        className="h-11 w-11 items-center justify-center rounded-full bg-danger"
        onPress={() => void speechService.stop()}
      >
        <AppIcon color="#FFFFFF" name="square" size={20} />
      </Pressable>
    </View>
  );
}
