import { Modal, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/components/Button/Button';
import { Typography } from '@/shared/components/Typography/Typography';

import type { FeedbackCategory } from '../types';

const options: readonly FeedbackCategory[] = [
  'helpful',
  'not_helpful',
  'transcription_problem',
  'wrong_language',
  'incorrect_answer',
  'audio_problem',
];

interface FeedbackSheetProps {
  visible: boolean;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (category: FeedbackCategory) => void;
}

export function FeedbackSheet({
  visible,
  submitting = false,
  onClose,
  onSubmit,
}: FeedbackSheetProps) {
  const { t } = useTranslation();
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-end bg-black/40"
        onPress={onClose}
        accessibilityLabel={t('a11y.closeFeedback')}
      >
        <Pressable
          className="gap-3 rounded-t-card bg-surface p-6 pb-10"
          onPress={(event) => event.stopPropagation()}
          accessibilityViewIsModal
        >
          <Typography variant="title">{t('feedback.title')}</Typography>
          <Typography className="text-muted">{t('feedback.prompt')}</Typography>
          <View className="gap-2">
            {options.map((option) => (
              <Button
                key={option}
                variant="secondary"
                disabled={submitting}
                onPress={() => onSubmit(option)}
              >
                {t(`feedback.${option}`)}
              </Button>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
