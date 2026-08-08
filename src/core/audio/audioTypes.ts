import type { AudioRecorder } from 'expo-audio';

export type ManagedAudioRecorder = AudioRecorder;

export interface CompletedRecording {
  uri: string;
  durationMillis: number;
}

export type MicrophonePermission = 'granted' | 'denied' | 'undetermined';
