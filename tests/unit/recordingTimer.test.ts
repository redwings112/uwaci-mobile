import { formatRecordingDuration } from '@/features/voice/components/RecordingTimer';

describe('formatRecordingDuration', () => {
  it('formats milliseconds as a stable minute clock', () => {
    expect(formatRecordingDuration(0)).toBe('0:00');
    expect(formatRecordingDuration(65_999)).toBe('1:05');
  });
});
