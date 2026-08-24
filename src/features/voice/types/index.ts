export type VoiceStatus =
  | 'idle'
  | 'requesting_permission'
  | 'ready'
  | 'recording'
  | 'stopping'
  | 'processing_audio'
  | 'uploading'
  | 'response_received'
  | 'preparing_speech'
  | 'speaking'
  | 'error';

export type VoiceThinkingStage = 'transcribing' | 'reasoning';

export interface VoiceThinkingState {
  activeStage: VoiceThinkingStage | null;
  completed: Partial<Record<VoiceThinkingStage, number>>;
}

export interface VoiceState {
  status: VoiceStatus;
  recordingUri: string | null;
  durationMillis: number;
  errorMessage: string | null;
  thinking: VoiceThinkingState;
}

export interface VoiceQueryInput {
  uri: string;
  preferredLanguage: string;
  conversationId?: string;
}
