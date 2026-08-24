import {
  recordingUpdated,
  voiceFailed,
  voiceReducer,
  voiceReset,
  voiceStatusChanged,
  voiceThinkingCompleted,
  voiceThinkingStarted,
} from '@/features/voice/state/voiceSlice';

describe('voice state machine', () => {
  it('moves through recording and processing without overlapping flags', () => {
    let state = voiceReducer(undefined, voiceStatusChanged('requesting_permission'));
    state = voiceReducer(state, voiceStatusChanged('recording'));
    state = voiceReducer(state, voiceStatusChanged('stopping'));
    state = voiceReducer(state, voiceStatusChanged('processing_audio'));
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

  it('represents natural speech preparation without claiming playback started', () => {
    const state = voiceReducer(undefined, voiceStatusChanged('preparing_speech'));
    expect(state.status).toBe('preparing_speech');
    expect(state.errorMessage).toBeNull();
  });

  it('tracks measured streamed backend stages', () => {
    let state = voiceReducer(undefined, voiceThinkingStarted('transcribing'));
    state = voiceReducer(state, voiceThinkingCompleted({ stage: 'transcribing', durationMs: 420 }));
    state = voiceReducer(state, voiceThinkingStarted('reasoning'));
    expect(state.thinking).toEqual({
      activeStage: 'reasoning',
      completed: { transcribing: 420 },
    });
  });
});
