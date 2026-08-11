import { normalizeAudioLevel } from '@/core/audio/audioMetering';

describe('audio metering', () => {
  it.each([
    [undefined, 0],
    [Number.NaN, 0],
    [-80, 0],
    [-60, 0],
    [-30, 0.5],
    [0, 1],
    [10, 1],
  ])('normalizes %s dB to %s', (metering, expected) => {
    expect(normalizeAudioLevel(metering)).toBe(expected);
  });
});
