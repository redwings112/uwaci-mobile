import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import {
  accentColorChanged,
  bubbleStyleChanged,
  increaseContrastChanged,
  reduceMotionChanged,
  textSizeChanged,
  themeModeChanged,
  type AccentColor,
  type BubbleStyle,
  type TextSize,
  type ThemeMode,
} from '@/features/settings/state/settingsSlice';
import { AppHeader } from '@/shared/components/AppHeader/AppHeader';
import { AppIcon, type AppIconName } from '@/shared/components/AppIcon/AppIcon';
import { SurfaceCard } from '@/shared/components/SurfaceCard/SurfaceCard';
import { UwaciLogo } from '@/shared/components/UwaciLogo/UwaciLogo';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/tokens';

const accentHex: Record<AccentColor, string> = {
  blue: '#1268F5',
  violet: '#6F45EF',
  fuchsia: '#C43BE4',
  cyan: '#10BFC5',
  green: '#64C84A',
  orange: '#FFA51F',
  coral: '#FB596A',
};

const themes: { value: ThemeMode; key: string; icon: AppIconName }[] = [
  { value: 'light', key: 'light', icon: 'sun' },
  { value: 'dark', key: 'dark', icon: 'moon' },
  { value: 'system', key: 'system', icon: 'monitor' },
];

function cycle<T extends string>(current: T, values: readonly T[]): T {
  const index = values.indexOf(current);
  return values[(index + 1) % values.length] ?? values[0]!;
}

export function AppearanceScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const settings = useAppSelector((state) => state.settings);
  const accent = accentHex[settings.accentColor];
  const darkPreview = settings.themeMode === 'dark';
  const textClass =
    settings.textSize === 'small'
      ? 'text-xs'
      : settings.textSize === 'large'
        ? 'text-base'
        : 'text-sm';
  const bubbleClass =
    settings.bubbleStyle === 'compact'
      ? 'rounded-lg'
      : settings.bubbleStyle === 'soft'
        ? 'rounded-2xl'
        : 'rounded-control';

  return (
    <SafeAreaView className="flex-1 bg-canvas dark:bg-[#111126]" edges={['top', 'bottom']}>
      <AppHeader
        back
        onBack={() => router.back()}
        actionLabel="Appearance help"
        actionIcon="help"
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-3 pb-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xl font-bold text-ink">{t('appearance.title')}</Text>
        <Text className="mt-1 text-xs text-muted">{t('appearance.subtitle')}</Text>

        <Text className="mb-2 mt-5 text-xs font-semibold text-muted">{t('appearance.theme')}</Text>
        <View className="flex-row gap-2">
          {themes.map((theme) => {
            const selected = settings.themeMode === theme.value;
            const dark = theme.value === 'dark';
            return (
              <Pressable
                key={theme.value}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                className={`flex-1 items-center rounded-control border p-2 ${selected ? 'border-brand' : 'border-border'} bg-surface`}
                onPress={() => dispatch(themeModeChanged(theme.value))}
              >
                <View
                  className={`h-28 w-full rounded-lg border border-border p-3 ${dark ? 'bg-[#111126]' : 'bg-white'}`}
                >
                  <AppIcon color={dark ? '#FFFFFF' : '#FFCC45'} name={theme.icon} size={19} />
                  <View
                    className={`mt-2 h-2 w-2/3 rounded-full ${dark ? 'bg-white/20' : 'bg-border'}`}
                  />
                  <View
                    className={`mt-2 h-7 rounded-md ${dark ? 'bg-[#24213F]' : 'bg-lavender'}`}
                  />
                  {selected ? (
                    <View className="absolute right-1 top-1 h-4 w-4 items-center justify-center rounded-full bg-brand">
                      <AppIcon color="#FFFFFF" name="check" size={12} strokeWidth={3} />
                    </View>
                  ) : null}
                </View>
                <Text
                  className={`mt-2 text-xs font-semibold ${selected ? 'text-brand' : 'text-ink dark:text-white'}`}
                >
                  {t(`appearance.${theme.key}`)}
                </Text>
                <Text className="mt-0.5 text-xs text-muted">
                  {t(`appearance.${theme.key}Helper`)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mb-2 mt-5 text-xs font-semibold text-muted">
          {t('appearance.accentColor')}
        </Text>
        <View className="flex-row justify-between">
          {(Object.keys(accentHex) as AccentColor[]).map((color) => {
            const selected = settings.accentColor === color;
            return (
              <Pressable
                key={color}
                accessibilityRole="radio"
                accessibilityLabel={`${color} accent`}
                accessibilityState={{ selected }}
                className={`h-9 w-9 items-center justify-center rounded-full ${selected ? 'border-2 border-brand' : ''}`}
                onPress={() => dispatch(accentColorChanged(color))}
              >
                <View
                  className="h-7 w-7 items-center justify-center rounded-full"
                  style={{ backgroundColor: accentHex[color] }}
                >
                  {selected ? (
                    <AppIcon color="#FFFFFF" name="check" size={14} strokeWidth={3} />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
        <Text className="mt-2 text-xs text-muted">
          This color is used for highlights, buttons and icons.
        </Text>

        <Text className="mb-2 mt-5 text-xs font-semibold text-muted">
          {t('appearance.displayOptions')}
        </Text>
        <SurfaceCard className="overflow-hidden">
          <Pressable
            className="min-h-16 flex-row items-center px-4"
            onPress={() =>
              dispatch(
                textSizeChanged(cycle<TextSize>(settings.textSize, ['small', 'medium', 'large'])),
              )
            }
          >
            <View className="h-8 w-8 items-center justify-center rounded-full bg-lavender">
              <Text className="text-brand">Aa</Text>
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold text-ink dark:text-white">
                {t('appearance.textSize')}
              </Text>
              <Text className="mt-0.5 text-xs text-muted">{t('appearance.textSizeHelper')}</Text>
            </View>
            <Text className="text-xs text-muted">
              {settings.textSize[0]?.toUpperCase()}
              {settings.textSize.slice(1)}
            </Text>
            <AppIcon color="#777789" name="chevronRight" size={19} />
          </Pressable>
          <Pressable
            className="min-h-16 flex-row items-center border-t border-border px-4"
            onPress={() =>
              dispatch(
                bubbleStyleChanged(
                  cycle<BubbleStyle>(settings.bubbleStyle, ['rounded', 'soft', 'compact']),
                ),
              )
            }
          >
            <View className="h-8 w-8 items-center justify-center rounded-full bg-lavender">
              <AppIcon color={colors.brand} name="messageSquare" size={20} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold text-ink dark:text-white">
                {t('appearance.bubbleStyle')}
              </Text>
              <Text className="mt-0.5 text-xs text-muted">{t('appearance.bubbleStyleHelper')}</Text>
            </View>
            <Text className="text-xs text-muted">
              {settings.bubbleStyle[0]?.toUpperCase()}
              {settings.bubbleStyle.slice(1)}
            </Text>
            <AppIcon color="#777789" name="chevronRight" size={19} />
          </Pressable>
          <View className="min-h-16 flex-row items-center border-t border-border px-4">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-lavender">
              <AppIcon color={colors.brand} name="waves" size={20} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold text-ink dark:text-white">
                {t('appearance.reduceMotion')}
              </Text>
              <Text className="mt-0.5 text-xs text-muted">
                {t('appearance.reduceMotionHelper')}
              </Text>
            </View>
            <Switch
              value={settings.reduceMotion}
              onValueChange={(value) => {
                dispatch(reduceMotionChanged(value));
              }}
              trackColor={{ false: '#E8E7EE', true: accent }}
            />
          </View>
          <View className="min-h-16 flex-row items-center border-t border-border px-4">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-lavender">
              <AppIcon color={colors.brand} name="contrast" size={20} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold text-ink dark:text-white">
                {t('appearance.increaseContrast')}
              </Text>
              <Text className="mt-0.5 text-xs text-muted">
                {t('appearance.increaseContrastHelper')}
              </Text>
            </View>
            <Switch
              value={settings.increaseContrast}
              onValueChange={(value) => {
                dispatch(increaseContrastChanged(value));
              }}
              trackColor={{ false: '#E8E7EE', true: accent }}
            />
          </View>
        </SurfaceCard>

        <Text className="mb-2 mt-5 text-xs font-semibold text-muted">
          {t('appearance.preview')}
        </Text>
        <View
          className={`${darkPreview ? 'bg-[#111126]' : 'bg-white'} rounded-control border border-border p-3`}
        >
          <View className={`max-w-[75%] self-end ${bubbleClass} bg-lavender px-3 py-2`}>
            <Text className={`${textClass} ${darkPreview ? 'text-[#15142C]' : 'text-ink'}`}>
              Uwaci, explique-moi comment je peux kobanda business na $200.
            </Text>
            <Text className="mt-1 text-right text-xs text-muted">9:41 AM ✓✓</Text>
          </View>
          <View
            className={`mt-2 max-w-[85%] ${bubbleClass} border border-border bg-surface px-3 py-2`}
          >
            <View className="mb-1 flex-row items-center">
              <UwaciLogo compact />
              <View className="ml-auto">
                <AppIcon color="#777789" name="volume" size={20} />
              </View>
            </View>
            <Text
              className={`${textClass} ${darkPreview ? 'text-white' : settings.increaseContrast ? 'font-medium text-black' : 'text-ink'}`}
            >
              Avec $200 à Kinshasa, tu peux commencer un petit business rentable et évoluer
              progressivement.
            </Text>
          </View>
          <View className="mt-3 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
