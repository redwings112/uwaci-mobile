import { setAudioModeAsync } from 'expo-audio';

import { cancelAudioRecording, startAudioRecording } from '@/core/audio/audioRecorder';

jest.mock('expo-audio', () => ({
  setAudioModeAsync: jest.fn(async () => undefined),
}));

describe('cancelAudioRecording', () => {
  beforeEach(() => jest.clearAllMocks());

  it('treats an automatically released recorder as already cleaned up', async () => {
    const recorder = {
      get isRecording(): boolean {
        throw new Error('Cannot use shared object that was already released');
      },
      get uri(): string | null {
        throw new Error('Cannot use shared object that was already released');
      },
      stop: jest.fn(),
    };

    await expect(cancelAudioRecording(recorder as never)).resolves.toBeUndefined();
    expect(setAudioModeAsync).toHaveBeenCalledWith({
      allowsRecording: false,
      playsInSilentMode: true,
    });
  });
});

describe('startAudioRecording', () => {
  beforeEach(() => jest.clearAllMocks());

  it('uses the hook-prepared recorder without preparing it a second time', async () => {
    const recorder = {
      getStatus: jest.fn(() => ({ canRecord: true })),
      prepareToRecordAsync: jest.fn(),
      record: jest.fn(),
    };

    await startAudioRecording(recorder as never);

    expect(recorder.prepareToRecordAsync).not.toHaveBeenCalled();
    expect(recorder.record).toHaveBeenCalledWith({ forDuration: expect.any(Number) });
  });

  it('prepares a recorder again only after an interrupted or completed session', async () => {
    const recorder = {
      getStatus: jest
        .fn()
        .mockReturnValueOnce({ canRecord: false, isRecording: false })
        .mockReturnValueOnce({ canRecord: true, isRecording: false }),
      prepareToRecordAsync: jest.fn(async () => undefined),
      record: jest.fn(),
    };

    await startAudioRecording(recorder as never);

    expect(recorder.prepareToRecordAsync).toHaveBeenCalledTimes(1);
    expect(recorder.record).toHaveBeenCalledTimes(1);
  });

  it('does not start the Android recorder twice while it is already recording', async () => {
    const recorder = {
      getStatus: jest.fn(() => ({ canRecord: true, isRecording: true })),
      prepareToRecordAsync: jest.fn(),
      record: jest.fn(),
    };

    await startAudioRecording(recorder as never);

    expect(recorder.prepareToRecordAsync).not.toHaveBeenCalled();
    expect(recorder.record).not.toHaveBeenCalled();
  });
});
