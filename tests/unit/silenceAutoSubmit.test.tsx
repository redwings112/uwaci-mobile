import { renderHook } from '@testing-library/react-native';

import { useSilenceAutoSubmit } from '@/features/voice/hooks/useSilenceAutoSubmit';

describe('silence auto-submit', () => {
  afterEach(() => jest.restoreAllMocks());

  it('submits once after speech followed by a natural pause', () => {
    const onSilence = jest.fn();
    let now = 1_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    const { rerender } = renderHook(
      (props: { audioLevel: number; durationMillis: number }) =>
        useSilenceAutoSubmit({ recording: true, onSilence, ...props }),
      { initialProps: { audioLevel: 0.5, durationMillis: 800 } },
    );

    now = 2_000;
    rerender({ audioLevel: 0.1, durationMillis: 1_800 });
    expect(onSilence).not.toHaveBeenCalled();

    now = 2_700;
    rerender({ audioLevel: 0.1, durationMillis: 2_500 });
    rerender({ audioLevel: 0.1, durationMillis: 2_600 });
    expect(onSilence).toHaveBeenCalledTimes(1);
  });

  it('does not submit ambient silence before speech is heard', () => {
    const onSilence = jest.fn();
    const { rerender } = renderHook(
      (durationMillis: number) =>
        useSilenceAutoSubmit({
          recording: true,
          audioLevel: 0.05,
          durationMillis,
          onSilence,
        }),
      { initialProps: 1_000 },
    );
    rerender(10_000);
    expect(onSilence).not.toHaveBeenCalled();
  });
});
