import { Typography } from '@/shared/components/Typography/Typography';

export function formatRecordingDuration(durationMillis: number): string {
  const totalSeconds = Math.floor(durationMillis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function RecordingTimer({ durationMillis }: { durationMillis: number }) {
  return (
    <Typography
      accessibilityLabel={`Recording time ${formatRecordingDuration(durationMillis)}`}
      className="font-semibold text-danger"
    >
      {formatRecordingDuration(durationMillis)}
    </Typography>
  );
}
