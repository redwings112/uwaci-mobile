import { env } from './env';

export const appConfig = {
  name: 'Uwaci',
  version: '0.1.0',
  apiBaseUrl: env.apiBaseUrl.replace(/\/$/, ''),
  isProduction: env.appEnv === 'production',
  maxRecordingDurationSeconds: 120,
} as const;
