import { en } from './en';
import { pt } from './pt';
import type { Content, Lang } from './types';

export const contents: Record<Lang, Content> = { pt, en };
export const DEFAULT_LANG: Lang = 'pt';
export const LANGS: Lang[] = ['pt', 'en'];

export const isLang = (value: unknown): value is Lang => value === 'pt' || value === 'en';

export type * from './types';
