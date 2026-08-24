import { Button } from '@/shared/components/Button/Button';
import { useTranslation } from 'react-i18next';

export function RetryRecordingButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <Button variant="secondary" accessibilityLabel={t('a11y.retryRecording')} onPress={onPress}>
      Record again
    </Button>
  );
}
