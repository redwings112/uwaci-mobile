import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LanguageSelector } from '@/features/language/components/LanguageSelector';
import {
  preferredLanguageChanged,
  uiLanguageChanged,
} from '@/features/language/state/languageSlice';
import { selectPreferredLanguage, selectUiLanguage } from '@/features/language/state/selectors';
import { AppHeader } from '@/shared/components/AppHeader/AppHeader';
import { SurfaceCard } from '@/shared/components/SurfaceCard/SurfaceCard';
import { Typography } from '@/shared/components/Typography/Typography';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const uiLanguages = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
] as const;

export function LanguageScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const language = useAppSelector(selectPreferredLanguage);
  const uiLanguage = useAppSelector(selectUiLanguage);

  return (
    <SafeAreaView className="flex-1 bg-canvas dark:bg-[#111126]" edges={['top', 'bottom']}>
      <AppHeader back onBack={() => router.back()} />
      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8">
        <Typography variant="title">{t('language.title')}</Typography>
        <Typography variant="caption" className="mt-1 leading-5">
          {t('language.subtitle')}
        </Typography>

        <SurfaceCard className="mt-5 gap-3 p-4">
          <Typography variant="label">{t('language.interface')}</Typography>
          <Typography variant="caption" className="leading-5">
            {t('language.interfaceHelper')}
          </Typography>
          <View accessibilityRole="radiogroup" className="mt-1 flex-row gap-2">
            {uiLanguages.map((option) => {
              const selected = option.code === uiLanguage;
              return (
                <Pressable
                  key={option.code}
                  accessibilityRole="radio"
                  accessibilityLabel={option.label}
                  accessibilityState={{ selected }}
                  className={`min-h-12 flex-1 items-center justify-center rounded-control border px-4 ${selected ? 'border-brand bg-brand' : 'border-border bg-surface'}`}
                  onPress={() => dispatch(uiLanguageChanged(option.code))}
                >
                  <Typography
                    variant="label"
                    className={selected ? 'text-white' : 'text-ink dark:text-white'}
                  >
                    {option.label}
                  </Typography>
                </Pressable>
              );
            })}
          </View>
        </SurfaceCard>

        <SurfaceCard className="mt-4 gap-3 p-4">
          <Typography variant="label">{t('language.conversation')}</Typography>
          <Typography variant="caption" className="leading-5">
            {t('language.conversationHelper')}
          </Typography>
          <LanguageSelector
            value={language}
            onChange={(value) => dispatch(preferredLanguageChanged(value))}
          />
        </SurfaceCard>
      </ScrollView>
    </SafeAreaView>
  );
}
