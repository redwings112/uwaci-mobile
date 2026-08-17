import type { Href } from 'expo-router';

import type { PipeId, PipeNavigationConfig } from './pipe.types';

export function pipeRootHref(pipe: Exclude<PipeId, 'pipe0'>): Href {
  return {
    pathname: '/(app)/pipe/[pipeId]',
    params: { pipeId: pipe },
  } as unknown as Href;
}

const sharedContextFooter = (pipe: Exclude<PipeId, 'pipe0'>) =>
  [
    { id: 'home', icon: 'home', labelKey: 'tabs.home', destination: 'home' },
    {
      id: 'context',
      icon: 'activity',
      labelKey: `pipes.${pipe}.label`,
      destination: pipeRootHref(pipe),
    },
    { id: 'menu', icon: 'menu', labelKey: 'tabs.menu', destination: 'menu' },
  ] as const;

export const PIPE_NAVIGATION_CONFIG = {
  pipe0: {
    id: 'pipe0',
    labelKey: 'pipes.pipe0.label',
    descriptionKey: 'pipes.pipe0.description',
    defaultRoute: '/(app)',
    available: true,
    footer: [
      { id: 'home', icon: 'home', labelKey: 'tabs.home', destination: '/(app)' },
      {
        id: 'history',
        icon: 'history',
        labelKey: 'tabs.history',
        destination: '/(app)/history',
      },
      {
        id: 'saved',
        icon: 'bookmark',
        labelKey: 'tabs.saved',
        destination: '/(app)/saved',
      },
      {
        id: 'discover',
        icon: 'compass',
        labelKey: 'tabs.discover',
        destination: '/(app)/discover',
      },
      { id: 'menu', icon: 'menu', labelKey: 'tabs.menu', destination: 'menu' },
    ],
  },
  pipe1: {
    id: 'pipe1',
    labelKey: 'pipes.pipe1.label',
    descriptionKey: 'pipes.pipe1.description',
    defaultRoute: pipeRootHref('pipe1'),
    available: false,
    footer: sharedContextFooter('pipe1'),
  },
  pipe2: {
    id: 'pipe2',
    labelKey: 'pipes.pipe2.label',
    descriptionKey: 'pipes.pipe2.description',
    defaultRoute: pipeRootHref('pipe2'),
    available: false,
    footer: sharedContextFooter('pipe2'),
  },
  pipe3: {
    id: 'pipe3',
    labelKey: 'pipes.pipe3.label',
    descriptionKey: 'pipes.pipe3.description',
    defaultRoute: pipeRootHref('pipe3'),
    available: false,
    footer: sharedContextFooter('pipe3'),
  },
  pipe4: {
    id: 'pipe4',
    labelKey: 'pipes.pipe4.label',
    descriptionKey: 'pipes.pipe4.description',
    defaultRoute: pipeRootHref('pipe4'),
    available: false,
    footer: sharedContextFooter('pipe4'),
  },
} as const satisfies Record<PipeId, PipeNavigationConfig>;

export const PIPE_IDS = Object.keys(PIPE_NAVIGATION_CONFIG) as PipeId[];

export function isPipeId(value: string | string[] | undefined): value is PipeId {
  return typeof value === 'string' && value in PIPE_NAVIGATION_CONFIG;
}

export function getPipeConfig(pipe: PipeId): PipeNavigationConfig {
  return PIPE_NAVIGATION_CONFIG[pipe];
}
