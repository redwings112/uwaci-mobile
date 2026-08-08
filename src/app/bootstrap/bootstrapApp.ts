import { initializeLocalization } from '@/localization';

let bootstrapped = false;

export async function bootstrapApp(): Promise<void> {
  if (bootstrapped) return;
  await initializeLocalization();
  bootstrapped = true;
}
