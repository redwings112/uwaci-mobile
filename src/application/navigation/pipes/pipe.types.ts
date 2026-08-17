import type { Href } from 'expo-router';

import type { AppIconName } from '@/shared/components/AppIcon/AppIcon';

export type PipeId = 'pipe0' | 'pipe1' | 'pipe2' | 'pipe3' | 'pipe4';

export type PipeFooterItemId = 'home' | 'history' | 'saved' | 'discover' | 'context' | 'menu';

export interface PipeFooterItem {
  id: PipeFooterItemId;
  icon: AppIconName;
  labelKey: string;
  destination: 'home' | 'menu' | Href;
}

export interface PipeNavigationConfig {
  id: PipeId;
  labelKey: string;
  descriptionKey: string;
  defaultRoute: Href;
  footer: readonly PipeFooterItem[];
  available: boolean;
}

export interface CrossPipeNavigationTarget {
  pipe: PipeId;
  route?: 'root';
}
