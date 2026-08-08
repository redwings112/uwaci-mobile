import { getRecordingPermissionsAsync, requestRecordingPermissionsAsync } from 'expo-audio';

import type { MicrophonePermission } from './audioTypes';

function normalize(granted: boolean, canAskAgain: boolean): MicrophonePermission {
  if (granted) return 'granted';
  return canAskAgain ? 'undetermined' : 'denied';
}

export async function getMicrophonePermission(): Promise<MicrophonePermission> {
  const permission = await getRecordingPermissionsAsync();
  return normalize(permission.granted, permission.canAskAgain);
}

export async function requestMicrophonePermission(): Promise<MicrophonePermission> {
  const permission = await requestRecordingPermissionsAsync();
  return normalize(permission.granted, permission.canAskAgain);
}
