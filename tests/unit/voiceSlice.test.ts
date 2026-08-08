import {
  recordingUpdated,
  voiceFailed,
  voiceReducer,
  voiceReset,
  voiceStatusChanged,
} from '@/features/voice/state/voiceSlice';

describe('voice state machine', () => {
  it('moves through recording and processing without overlapping flags', () => {
    let state = voiceReducer(undefined, voiceStatusChanged('requesting_permission'));
    state = voiceReducer(state, voiceStatusChanged('recording'));
    state = voiceReducer(
      state,
      recordingUpdated({ uri: 'file:///question.m4a', durationMillis: 1300 }),
    );
    state = voiceReducer(state, voiceStatusChanged('uploading'));
    expect(state).toMatchObject({
      status: 'uploading',
      recordingUri: 'file:///question.m4a',
      durationMillis: 1300,
    });
  });

  it('supports recoverable failure and reset', () => {
    const failed = voiceReducer(undefined, voiceFailed('Microphone permission is required.'));
    expect(failed.status).toBe('error');
    expect(voiceReducer(failed, voiceReset())).toMatchObject({
      status: 'idle',
      errorMessage: null,
    });
  });
});
