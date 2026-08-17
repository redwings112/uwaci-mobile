import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/shared/components/AppIcon/AppIcon';
import { colors } from '@/theme/tokens';

const steps: readonly { icon: AppIconName; labelKey: string }[] = [
  { icon: 'mic', labelKey: 'voice.progressSpoke' },
  { icon: 'more', labelKey: 'voice.progressProcessing' },
  { icon: 'volume', labelKey: 'voice.progressAnswer' },
];

export function ThinkingProgress({ activeStep }: { activeStep: number }) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-start px-2 pt-1">
      {steps.map((step, index) => {
        const done = index < activeStep;
        const active = index === activeStep;
        const reached = done || active;
        return (
          <View key={step.labelKey} className="flex-1 items-center">
            <View className="w-full flex-row items-center">
              <View
                className={`h-0.5 flex-1 ${index === 0 ? 'bg-transparent' : reached ? 'bg-brand' : 'bg-border'}`}
              />
              <View
                className={`h-11 w-11 items-center justify-center rounded-full border-2 ${
                  done
                    ? 'border-brand bg-brand'
                    : active
                      ? 'border-brand bg-surface'
                      : 'border-border bg-surface'
                }`}
              >
                <AppIcon
                  color={done ? '#FFFFFF' : active ? colors.brand : colors.muted}
                  name={step.icon}
                  size={20}
                />
              </View>
              <View
                className={`h-0.5 flex-1 ${index === steps.length - 1 ? 'bg-transparent' : done ? 'bg-brand' : 'bg-border'}`}
              />
            </View>
            <Text
              className={`mt-2 text-center text-[11px] ${reached ? 'font-semibold text-ink dark:text-white' : 'text-muted'}`}
            >
              {t(step.labelKey)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
