export interface SpeakOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  onDone?: () => void;
  onError?: () => void;
  onStopped?: () => void;
  onUnavailable?: () => void;
}
