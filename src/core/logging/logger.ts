import { appConfig } from '@/application/config/appConfig';

type SafeMetadata = Record<string, string | number | boolean | null | undefined>;

export const logger = {
  warn(message: string, metadata?: SafeMetadata): void {
    if (!appConfig.isProduction) console.warn(message, metadata ?? {});
  },
  error(message: string, metadata?: SafeMetadata): void {
    console.error(message, metadata ?? {});
  },
};
