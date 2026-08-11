import { Pressable, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { LanguageSelector } from '@/features/language/components/LanguageSelector';
import {
  preferredLanguageChanged,
  uiLanguageChanged,
} from '@/features/language/state/languageSlice';
import { selectPreferredLanguage, selectUiLanguage } from '@/features/language/state/selectors';
import { voiceResponsesChanged } from '@/features/settings/state/settingsSlice';
import { IconButton } from '@/shared/components/IconButton/IconButton';
import { AppIcon } from '@/shared/components/AppIcon/AppIcon';
import { Screen } from '@/shared/components/Screen/Screen';
import { Typography } from '@/shared/components/Typography/Typography';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export function SettingsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectPreferredLanguage);
  const uiLanguage = useAppSelector(selectUiLanguage);
  const voiceEnabled = useAppSelector((state) => state.settings.voiceResponsesEnabled);
  const themeMode = useAppSelector((state) => state.settings.themeMode);
  const { t } = useTranslation();
  return (
    <Screen scroll>
      <View className="mb-8 flex-row items-center gap-3">
        <IconButton
          icon="arrowLeft"
          label="Go back"
          className="bg-surface"
          onPress={() => router.back()}
        />
        <Typography variant="title">{t('settings.title')}</Typography>
      </View>
      <View className="gap-3 rounded-card border border-border bg-surface p-5">
        <Typography variant="label">{t('settings.interfaceLanguage')}</Typography>
        <View accessibilityRole="radiogroup" className="flex-row gap-2">
          {(
            [
              { code: 'en', label: 'English' },
              { code: 'fr', label: 'Français' },
            ] as const
          ).map((option) => {
            const selected = option.code === uiLanguage;
            return (
              <Pressable
                key={option.code}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                className={`min-h-12 flex-1 items-center justify-center rounded-control border px-4 ${selected ? 'border-brand bg-brand' : 'border-border bg-surface'}`}
                onPress={() => dispatch(uiLanguageChanged(option.code))}
              >
                <Typography variant="label" className={selected ? 'text-white' : 'text-ink'}>
                  {option.label}
                </Typography>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View className="mt-4 gap-3 rounded-card border border-border bg-surface p-5">
        <Typography variant="label">{t('settings.language')}</Typography>
        <LanguageSelector
          value={language}
          onChange={(value) => dispatch(preferredLanguageChanged(value))}
        />
      </View>
      <View className="mt-4 flex-row items-center justify-between rounded-card border border-border bg-surface p-5">
        <Typography variant="label" className="mr-4 flex-1">
          {t('settings.voiceResponse')}
        </Typography>
        <Switch
          accessibilityLabel={t('settings.voiceResponse')}
          trackColor={{ false: '#DDE3DD', true: '#75A68C' }}
          thumbColor={voiceEnabled ? '#215C45' : '#FFFFFF'}
          value={voiceEnabled}
          onValueChange={(value) => {
            dispatch(voiceResponsesChanged(value));
          }}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        className="mt-4 flex-row items-center justify-between rounded-card border border-border bg-surface p-5"
        onPress={() => router.push('/(app)/appearance')}
      >
        <View className="flex-1">
          <Typography variant="label">Appearance</Typography>
          <Typography variant="caption" className="mt-1">
            {themeMode[0]?.toUpperCase()}
            {themeMode.slice(1)} mode, accent and display options
          </Typography>
        </View>
        <AppIcon color="#777789" name="chevronRight" size={22} />
      </Pressable>
      <View className="mt-8 gap-2">
        <Typography variant="label">{t('settings.aboutTitle')}</Typography>
        <Typography className="text-muted">{t('settings.about')}</Typography>
        <Typography variant="caption">Version 0.1.0 · Core AI prototype</Typography>
      </View>
    </Screen>
  );
}
