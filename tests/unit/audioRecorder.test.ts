import { setAudioModeAsync } from 'expo-audio';

import { cancelAudioRecording } from '@/core/audio/audioRecorder';

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
