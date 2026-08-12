export type VoiceStatus =
  | 'idle'
  | 'requesting_permission'
  | 'ready'
  | 'recording'
  | 'stopping'
  | 'processing_audio'
  | 'uploading'
  | 'transcribing'
  | 'thinking'
  | 'response_received'
  | 'speaking'
  | 'error';

export interface VoiceState {
  status: VoiceStatus;
  recordingUri: string | null;
  durationMillis: number;
  errorMessage: string | null;
}

export interface VoiceQueryInput {
  uri: string;
  preferredLanguage: string;
  conversationId?: string;
}
