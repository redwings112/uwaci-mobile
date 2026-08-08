import { Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { LanguageSelector } from '@/features/language/components/LanguageSelector';
import { preferredLanguageChanged } from '@/features/language/state/languageSlice';
import { selectPreferredLanguage } from '@/features/language/state/selectors';
import { voiceResponsesChanged } from '@/features/settings/state/settingsSlice';
import { IconButton } from '@/shared/components/IconButton/IconButton';
import { Screen } from '@/shared/components/Screen/Screen';
import { Typography } from '@/shared/components/Typography/Typography';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export function SettingsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectPreferredLanguage);
  const voiceEnabled = useAppSelector((state) => state.settings.voiceResponsesEnabled);
  const { t } = useTranslation();
  return (
    <Screen scroll>
      <View className="mb-8 flex-row items-center gap-3">
        <IconButton icon="‹" label="Go back" className="bg-surface" onPress={() => router.back()} />
        <Typography variant="title">{t('settings.title')}</Typography>
      </View>
      <View className="gap-3 rounded-card border border-border bg-surface p-5">
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
      <View className="mt-8 gap-2">
        <Typography variant="label">About Uwaci</Typography>
        <Typography className="text-muted">{t('settings.about')}</Typography>
        <Typography variant="caption">Version 0.1.0 · Core AI prototype</Typography>
      </View>
    </Screen>
  );
}
