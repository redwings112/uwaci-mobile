import { shouldResumeListening, type HandsFreeConditions } from '@/features/voice/handsFree';

const listening: HandsFreeConditions = {
  listening: true,
  status: 'idle',
  focused: true,
  busy: false,
  speaking: false,
  hasError: false,
  turnInFlight: false,
};

describe('shouldResumeListening', () => {
  it('reopens the microphone once the turn settles', () => {
    expect(shouldResumeListening(listening)).toBe(true);
    expect(shouldResumeListening({ ...listening, status: 'ready' })).toBe(true);
  });

  it('stays quiet once the user steps out of the conversation', () => {
    expect(shouldResumeListening({ ...listening, listening: false })).toBe(false);
  });

  it('stays quiet while the screen is away, or the turn is still running', () => {
    expect(shouldResumeListening({ ...listening, focused: false })).toBe(false);
    expect(shouldResumeListening({ ...listening, busy: true })).toBe(false);
    expect(shouldResumeListening({ ...listening, speaking: true })).toBe(false);
    expect(shouldResumeListening({ ...listening, turnInFlight: true })).toBe(false);
    expect(shouldResumeListening({ ...listening, status: 'recording' })).toBe(false);
  });

  it('does not loop after a failure', () => {
    expect(shouldResumeListening({ ...listening, hasError: true })).toBe(false);
    expect(shouldResumeListening({ ...listening, status: 'error' })).toBe(false);
  });
});
