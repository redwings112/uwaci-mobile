import { Platform } from 'react-native';

export const MAX_RECORDING_SECONDS = 120;
export const MIN_RECORDING_MILLIS = 300;

export function getVoiceUploadMetadata(): { fileName: string; mimeType: string } {
  if (Platform.OS === 'web') {
    return { fileName: 'uwaci-question.webm', mimeType: 'audio/webm' };
  }
  // Expo's high-quality Android/iOS preset records MPEG-4 AAC in an .m4a file.
  return { fileName: 'uwaci-question.m4a', mimeType: 'audio/x-m4a' };
}
