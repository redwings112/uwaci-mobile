import { Button } from '@/shared/components/Button/Button';

export function RetryRecordingButton({ onPress }: { onPress: () => void }) {
  return (
    <Button variant="secondary" accessibilityLabel="Record the question again" onPress={onPress}>
      Record again
    </Button>
  );
}
