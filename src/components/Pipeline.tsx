import { Blocks, GraduationCap, Mail, UserRound, type LucideIcon } from 'lucide-react';
import { m } from 'framer-motion';
import { useMemo, useRef, type CSSProperties, type KeyboardEvent, type MouseEvent } from 'react';
import type { TabId } from '../content/types';
import { TAB_COLOR, TABS } from '../lib/tabs';
import { useApp } from '../state/app';

const ICONS: Record<TabId, LucideIcon> = {
  bronze: UserRound,
  silver: GraduationCap,
  gold: Blocks,
  contato: Mail,
};

/** Centro de cada nó, em % da largura da barra (4 colunas iguais). */
const nodeX = (tab: TabId) => 12.5 + TABS.indexOf(tab) * 25;

const PARTICLES = 5;
const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

/** Partículas que correm pelo cano do nó anterior ao novo, mudando de cor no caminho. */
function Travel({ from, to }: { from: TabId; to: TabId }) {
  const colors = useMemo(() => {
    const style = getComputedStyle(document.documentElement);
    const start = TABS.indexOf(from);
    const end = TABS.indexOf(to);
    const step = start < end ? 1 : -1;
    const path: string[] = [];
    for (let index = start; index !== end + step; index += step) {
      path.push(style.getPropertyValue(TAB_COLOR[TABS[index]]).trim());
    }
    return path;
  }, [from, to]);

  return (
    <>
      {Array.from({ length: PARTICLES }, (_, index) => (
        <m.span
          key={index}
          className="absolute top-1/2 -mt-0.5 -ml-0.5 size-1 rounded-full"
          initial={{ left: `${nodeX(from)}%`, backgroundColor: colors[0], opacity: 0 }}
          animate={{
            left: `${nodeX(to)}%`,
            backgroundColor: colors,
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 0.42,
            delay: index * 0.018,
            ease: EASE_IN_OUT,
            opacity: { duration: 0.42, delay: index * 0.018, times: [0, 0.12, 0.85, 1] },
          }}
        />
      ))}
    </>
  );
}

/** Barra de abas: quatro nós ligados por um cano. No celular vira bottom nav. */
export function Pipeline() {
  const { t, tab, mounted, travel, goToTab } = useApp();
  const list = useRef<HTMLDivElement>(null);
  const selected = mounted ? tab : 'bronze';

  const focusTab = (id: TabId) => list.current?.querySelector<HTMLElement>(`#tab-${id}`)?.focus();

  const onKeyDown = (event: KeyboardEvent<HTMLAnchorElement>, id: TabId) => {
    const index = TABS.indexOf(id);
    let next: TabId | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = TABS[(index + 1) % TABS.length];
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = TABS[(index - 1 + TABS.length) % TABS.length];
    else if (event.key === 'Home') next = TABS[0];
    else if (event.key === 'End') next = TABS[TABS.length - 1];
    else if (event.key === ' ') next = id;
    if (!next) return;
    event.preventDefault();
    goToTab(next);
    focusTab(next);
  };

  const onClick = (event: MouseEvent<HTMLAnchorElement>, id: TabId) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    goToTab(id, { scroll: true });
  };

  return (
    <nav
      id="pipeline"
      aria-label={t.tabs.listLabel}
      className="pipeline-bar max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-30 max-md:border-t max-md:border-border max-md:bg-surface/95 max-md:pb-[env(safe-area-inset-bottom)] max-md:backdrop-blur-md md:bg-bg/80 md:py-3 md:backdrop-blur-md"
    >
      <div ref={list} role="tablist" aria-label={t.tabs.listLabel} className="container-page relative grid grid-cols-4 max-md:!px-0">
        {/* O cano: linha fina no topo da bottom nav; no desktop passa pelo centro dos nós. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-1 max-md:-translate-y-1/2 md:inset-x-6 md:top-[22px] lg:inset-x-10 md:-mt-0.5"
        >
          <svg className="absolute inset-0 size-full" viewBox="0 0 100 4" preserveAspectRatio="none">
            <defs>
              <linearGradient id="pipe-gradient" gradientUnits="userSpaceOnUse" x1="12.5" y1="0" x2="87.5" y2="0">
                <stop offset="0" style={{ stopColor: 'var(--bronze)' }} />
                <stop offset="0.333" style={{ stopColor: 'var(--silver)' }} />
                <stop offset="0.667" style={{ stopColor: 'var(--gold)' }} />
                <stop offset="1" style={{ stopColor: 'var(--output)' }} />
              </linearGradient>
            </defs>
            <line
              x1="12.5"
              y1="2"
              x2="87.5"
              y2="2"
              stroke="url(#pipe-gradient)"
              strokeWidth="2"
              style={{ strokeOpacity: 'var(--pipe-opacity)' }}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {/* Trecho já percorrido: o cano acende do primeiro nó até a aba ativa. */}
          <span className="pipe-fill" />
          <span className="pipe-idle" />
          <span className="pipe-idle" style={{ animationDelay: '-5.3s' }} />
          <span className="pipe-idle" style={{ animationDelay: '-10.6s' }} />
          {travel && <Travel key={travel.id} from={travel.from} to={travel.to} />}
        </div>

        {TABS.map((id) => {
          const NodeIcon = ICONS[id];
          const item = t.tabs.items[id];
          return (
            <a
              key={id}
              id={`tab-${id}`}
              href={`#${id}`}
              role="tab"
              aria-selected={selected === id}
              aria-controls={id}
              tabIndex={!mounted || selected === id ? 0 : -1}
              onClick={(event) => onClick(event, id)}
              onKeyDown={(event) => onKeyDown(event, id)}
              style={{ '--node': `var(${TAB_COLOR[id]})`, '--node-ink': `var(${TAB_COLOR[id]}-ink)` } as CSSProperties}
              className="node relative flex min-h-14 flex-col items-center gap-1 px-1 pt-2.5 pb-2 text-center -outline-offset-2 md:gap-2 md:rounded-[14px] md:p-0 md:pb-1 md:outline-offset-4"
            >
              <span className="node-dot flex size-7 items-center justify-center rounded-full border border-transparent md:size-11">
                <NodeIcon aria-hidden="true" className="size-5" />
              </span>
              <span className="label-mono hidden md:block">{item.layer}</span>
              <span className="node-label text-[0.6875rem] leading-tight font-medium md:text-[0.9375rem] md:font-semibold">
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
