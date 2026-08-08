import { Modal, Pressable, View } from 'react-native';

import { Button } from '@/shared/components/Button/Button';
import { Typography } from '@/shared/components/Typography/Typography';

import type { FeedbackCategory } from '../types';

const options: readonly { value: FeedbackCategory; label: string }[] = [
  { value: 'helpful', label: 'Helpful' },
  { value: 'not_helpful', label: 'Not helpful' },
  { value: 'transcription_problem', label: 'Transcription problem' },
  { value: 'wrong_language', label: 'Wrong language' },
  { value: 'incorrect_answer', label: 'Incorrect answer' },
  { value: 'audio_problem', label: 'Audio problem' },
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
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-end bg-black/40"
        onPress={onClose}
        accessibilityLabel="Close feedback"
      >
        <Pressable
          className="gap-3 rounded-t-card bg-surface p-6 pb-10"
          onPress={(event) => event.stopPropagation()}
          accessibilityViewIsModal
        >
          <Typography variant="title">Help improve Uwaci</Typography>
          <Typography className="text-muted">What best describes this response?</Typography>
          <View className="gap-2">
            {options.map((option) => (
              <Button
                key={option.value}
                variant="secondary"
                disabled={submitting}
                onPress={() => onSubmit(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
