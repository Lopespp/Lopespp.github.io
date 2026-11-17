import { useEffect, useId, useRef, useState } from 'react';
import type { Skill } from '../content/types';
import { useIsoLayoutEffect } from '../lib/hooks';
import { Icon } from '../lib/icons';

interface SkillChipProps {
  skill: Skill;
  /** Onde a skill foi usada (gerado a partir do `stack` dos projetos). */
  usedIn: string[];
  usedLabel: string;
  dailyLabel: string;
}

function ChipBody({ skill, dailyLabel, hasPopover }: { skill: Skill; dailyLabel: string; hasPopover: boolean }) {
  return (
    <>
      <Icon name={skill.icon} size={17} className="flex-none text-layer-ink" />
      <span className="min-w-0">
        <span
          className={`font-medium ${
            hasPopover ? 'underline decoration-muted/70 decoration-dotted underline-offset-4' : ''
          }`}
        >
          {skill.name}
        </span>
        {skill.detail && <span className="text-small block text-muted">{skill.detail}</span>}
      </span>
      {skill.daily && (
        <>
          <span aria-hidden="true" className="size-1.5 flex-none rounded-full bg-layer" />
          <span className="sr-only">({dailyLabel})</span>
        </>
      )}
    </>
  );
}

/**
 * Chip de skill. Quando há algo a mostrar ("onde usei" ou uma nota), vira um
 * botão com popover, aberto por hover ou foco após 150ms.
 */
export function SkillChip({ skill, usedIn, usedLabel, dailyLabel }: SkillChipProps) {
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const popover = useRef<HTMLSpanElement>(null);
  const id = useId();
  const hasPopover = usedIn.length > 0 || Boolean(skill.note);

  const show = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), 150);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    setOpen(false);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hide();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  // Mantém o popover dentro da tela (importante em 360px). Fechado, ele fica com
  // display: none para não alargar a página.
  useIsoLayoutEffect(() => {
    if (!open || !popover.current) return;
    const rect = popover.current.getBoundingClientRect();
    const margin = 12;
    const overflowRight = rect.right - shift - (document.documentElement.clientWidth - margin);
    const overflowLeft = margin - (rect.left - shift);
    if (overflowRight > 0) setShift(-overflowRight);
    else if (overflowLeft > 0) setShift(overflowLeft);
    else setShift(0);
  }, [open]);

  if (!hasPopover) {
    return (
      <span className="chip chip-static">
        <ChipBody skill={skill} dailyLabel={dailyLabel} hasPopover={false} />
      </span>
    );
  }

  return (
    <span className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      <button
        type="button"
        aria-describedby={id}
        onFocus={show}
        onBlur={hide}
        onClick={() => setOpen(true)}
        className="chip"
      >
        <ChipBody skill={skill} dailyLabel={dailyLabel} hasPopover />
      </button>
      <span
        ref={popover}
        id={id}
        role="tooltip"
        style={{ transform: `translateX(${shift}px)` }}
        className={`text-small absolute top-full left-0 z-10 mt-2 w-max max-w-[min(18rem,calc(100vw-1.5rem))] rounded-[8px] border border-border bg-surface-2 px-3 py-2 text-text shadow-card ${
          open ? '' : 'hidden'
        }`}
      >
        {usedIn.length > 0 && (
          <>
            <span className="label-mono block !text-[0.6875rem] text-muted">{usedLabel}</span>
            <span className="block">{usedIn.join(', ')}</span>
          </>
        )}
        {skill.note && <span className={`block ${usedIn.length > 0 ? 'mt-1 text-muted' : ''}`}>{skill.note}</span>}
      </span>
    </span>
  );
}
