import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { getPipeConfig } from '@/application/navigation/pipes/pipe.config';
import type {
  PipeFooterItem,
  PipeFooterItemId,
  PipeId,
} from '@/application/navigation/pipes/pipe.types';
import { usePipeNavigation } from '@/application/navigation/pipes/usePipeNavigation';
import { AppIcon } from '@/shared/components/AppIcon/AppIcon';
import { SpeechControlBar } from '@/shared/components/SpeechControlBar/SpeechControlBar';
import { colors } from '@/theme/tokens';

interface BottomTabBarProps {
  active: PipeFooterItemId;
  pipe?: PipeId;
  showSpeechControls?: boolean;
}

export function BottomTabBar({
  active,
  pipe = 'pipe0',
  showSpeechControls = true,
}: BottomTabBarProps) {
  const { t } = useTranslation();
  const { switchPipe, openMenu, navigate } = usePipeNavigation();
  const config = getPipeConfig(pipe);

  const activate = (item: PipeFooterItem) => {
    if (item.destination === 'home') switchPipe('pipe0');
    else if (item.destination === 'menu') openMenu(pipe);
    else navigate(item.destination);
  };

  return (
    <View>
      {showSpeechControls ? <SpeechControlBar /> : null}
      <View className="flex-row border-t border-border bg-surface px-1 pb-2 pt-1 dark:border-white/10 dark:bg-[#17152C]">
        {config.footer.map((item) => {
          const selected = item.id === active;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="tab"
              accessibilityLabel={t(item.labelKey)}
              accessibilityState={{ selected }}
              className="min-h-16 flex-1 items-center justify-center rounded-xl"
              onPress={() => activate(item)}
            >
              <View
                className={`mb-1 h-1 w-10 rounded-full ${selected ? 'bg-brand' : 'bg-transparent'}`}
              />
              <AppIcon
                color={selected ? colors.brand : '#777789'}
                name={item.icon}
                size={27}
                strokeWidth={selected ? 2.5 : 2}
              />
              <Text
                className={`mt-1 text-xs ${selected ? 'font-semibold text-brand' : 'text-muted'}`}
                numberOfLines={1}
              >
                {t(item.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
