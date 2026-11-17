import type { TabId } from '../content/types';

export const TABS: TabId[] = ['bronze', 'silver', 'gold', 'contato'];

/** Variável CSS com a cor de cada camada. */
export const TAB_COLOR: Record<TabId, string> = {
  bronze: '--bronze',
  silver: '--silver',
  gold: '--gold',
  contato: '--output',
};

/** Aceita `#contact` como apelido de `#contato`, para links em inglês. */
export function tabFromHash(hash: string): TabId | null {
  const value = hash.replace(/^#/, '').toLowerCase();
  if (value === 'contact') return 'contato';
  return (TABS as string[]).includes(value) ? (value as TabId) : null;
}
