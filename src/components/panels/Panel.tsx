import { m, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import type { TabId } from '../../content/types';
import { useApp } from '../../state/app';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

interface PanelProps {
  id: TabId;
  title: string;
  children: ReactNode;
}

/**
 * Conteúdo de uma aba. Todas as abas ficam no HTML (sem JS aparecem empilhadas);
 * com JS, só a aba ativa é exibida, entrando com fade + 8px.
 */
export function Panel({ id, title, children }: PanelProps) {
  const { t, mounted, shownTab, leaving, reducedMotion } = useApp();
  const active = shownTab === id;
  const visible = !mounted || (active && !leaving);
  const offset = reducedMotion ? 0 : 8;
  const duration = reducedMotion ? 0.15 : 0.28;

  const variants: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: EASE_OUT, staggerChildren: reducedMotion ? 0 : 0.04 },
    },
    hidden: { opacity: 0, y: offset, transition: { duration, ease: EASE_OUT } },
  };

  return (
    <m.section
      id={id}
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      hidden={mounted && !active}
      className="panel scroll-mt-44 max-md:scroll-mt-20"
      initial={false}
      animate={visible ? 'visible' : 'hidden'}
      variants={variants}
    >
      <PanelBlock>
        <p className="label-mono text-layer-ink" aria-hidden="true">
          {`// ${t.tabs.items[id].layer}`}
        </p>
        <h2 className="text-h2 mt-2">{title}</h2>
      </PanelBlock>
      {children}
    </m.section>
  );
}

/** Bloco de uma aba: entra escalonado (40ms) quando a aba abre. */
export function PanelBlock({ children, className }: { children: ReactNode; className?: string }) {
  const { reducedMotion } = useApp();
  const variants: Variants = {
    visible: { opacity: 1, y: 0, transition: { duration: reducedMotion ? 0.15 : 0.28, ease: EASE_OUT } },
    hidden: { opacity: 0, y: reducedMotion ? 0 : 8, transition: { duration: 0.15 } },
  };
  return (
    <m.div className={className} variants={variants}>
      {children}
    </m.div>
  );
}

export function SectionTitle({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h3 id={id} className="text-h3">
      {children}
    </h3>
  );
}
