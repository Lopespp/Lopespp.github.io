import { m, useInView } from 'framer-motion';
import { useRef, useState, type ReactNode } from 'react';
import { useIsoLayoutEffect } from '../lib/hooks';
import { useApp } from '../state/app';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Atraso em segundos, para escalonar itens de uma lista. */
  delay?: number;
  as?: 'div' | 'li';
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/**
 * Revela o conteúdo ao entrar na tela (fade + 16px para cima), uma vez só.
 * No HTML pré-renderizado o conteúdo já vem visível: só é escondido, via JS,
 * o que está abaixo da dobra ou numa aba fechada.
 */
export function Reveal({ children, className, delay = 0, as = 'div' }: RevealProps) {
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null);
  const [armed, setArmed] = useState(false);
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' });
  const { reducedMotion } = useApp();

  useIsoLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const belowFold = node.getBoundingClientRect().top > window.innerHeight * 0.92;
    if (node.offsetParent === null || belowFold) setArmed(true);
  }, []);

  const hidden = armed && !inView;
  const Component = as === 'li' ? m.li : m.div;

  return (
    <Component
      ref={ref}
      className={className}
      initial={false}
      animate={hidden ? { opacity: 0, y: reducedMotion ? 0 : 16 } : { opacity: 1, y: 0 }}
      transition={
        hidden
          ? { duration: 0 }
          : { duration: reducedMotion ? 0.15 : 0.6, ease: EASE_OUT, delay: reducedMotion ? 0 : delay }
      }
    >
      {children}
    </Component>
  );
}
