import type { RootState } from '@/store';

export const selectVoiceState = (state: RootState) => state.voice;
export const selectIsRecording = (state: RootState) => state.voice.status === 'recording';
export const selectVoiceBusy = (state: RootState) =>
  ['processing_audio', 'uploading'].includes(state.voice.status);
