import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/shared/components/AppIcon/AppIcon';
import { colors } from '@/theme/tokens';

import type { FeedbackCategory } from '../types';

export type AnswerVerdict = 'yes' | 'somewhat' | 'no';

export const VERDICT_CATEGORY: Record<AnswerVerdict, FeedbackCategory> = {
  yes: 'helpful',
  somewhat: 'not_helpful',
  no: 'not_helpful',
};

interface AnswerFeedbackRowProps {
  selected?: AnswerVerdict | null;
  disabled?: boolean;
  onSelect: (verdict: AnswerVerdict) => void;
}

export function AnswerFeedbackRow({
  selected = null,
  disabled = false,
  onSelect,
}: AnswerFeedbackRowProps) {
  const { t } = useTranslation();

  const options: readonly {
    verdict: AnswerVerdict;
    icon: AppIconName;
    label: string;
    detail: string;
    color: string;
  }[] = [
    {
      verdict: 'yes',
      icon: 'thumbsUp',
      label: t('answer.yes'),
      detail: t('answer.yesDetail'),
      color: colors.success,
    },
    {
      verdict: 'somewhat',
      icon: 'meh',
      label: t('answer.somewhat'),
      detail: t('answer.somewhatDetail'),
      color: colors.accent,
    },
    {
      verdict: 'no',
      icon: 'thumbsDown',
      label: t('answer.no'),
      detail: t('answer.noDetail'),
      color: colors.danger,
    },
  ];

  return (
    <View>
      <Text className="text-center text-xs text-muted">{t('answer.feedbackQuestion')}</Text>
      <View className="mt-2 flex-row gap-2">
        {options.map((option) => (
          <Pressable
            key={option.verdict}
            accessibilityRole="button"
            accessibilityLabel={`${option.label}. ${option.detail}`}
            accessibilityState={{ selected: selected === option.verdict, disabled }}
            className={`min-h-16 flex-1 items-center justify-center rounded-control border px-2 ${
              selected === option.verdict ? 'border-brand bg-lavender' : 'border-border bg-surface'
            } ${disabled ? 'opacity-60' : ''}`}
            disabled={disabled}
            onPress={() => onSelect(option.verdict)}
          >
            <AppIcon color={option.color} name={option.icon} size={20} />
            <Text className="mt-1 text-xs font-semibold text-ink dark:text-white">
              {option.label}
            </Text>
            <Text className="text-[10px] leading-3 text-muted">{option.detail}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
