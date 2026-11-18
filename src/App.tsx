import { AnimatePresence, domAnimation, LazyMotion, MotionConfig } from 'framer-motion';
import { Hand } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Bronze } from './components/panels/Bronze';
import { Contact } from './components/panels/Contact';
import { Gold } from './components/panels/Gold';
import { Silver } from './components/panels/Silver';
import { Pipeline } from './components/Pipeline';
import { Selector } from './components/Selector';
import { Toasts } from './components/Toasts';
import type { Lang } from './content/types';
import { AppProvider, useApp } from './state/app';

// Carregados só quando abertos: não pesam no carregamento inicial.
const SummaryCard = lazy(() => import('./components/SummaryCard'));
const Terminal = lazy(() => import('./components/Terminal'));
const HandMode = lazy(() => import('./components/HandMode'));

/** Atalho `~` do terminal, luz dos cards e recado no console. */
function useSmallDetails() {
  const { t, overlay, openOverlay } = useApp();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (overlay || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      // Em teclados ABNT e internacionais o til é uma tecla morta.
      const tilde =
        event.key === '~' ||
        event.key === '`' ||
        (event.key === 'Dead' && (event.code === 'Backquote' || (event.code === 'Quote' && !event.shiftKey)));
      if (!tilde) return;
      event.preventDefault();
      openOverlay('terminal');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [overlay, openOverlay]);

  // Luz que acompanha o mouse sobre os cards (só com mouse; o CSS cuida do resto).
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let frame = 0;
    let last: PointerEvent | null = null;
    const paint = () => {
      frame = 0;
      const card = (last?.target as Element | null)?.closest<HTMLElement>('.card');
      if (!card || !last) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${last.clientX - rect.left}px`);
      card.style.setProperty('--my', `${last.clientY - rect.top}px`);
    };
    const onMove = (event: PointerEvent) => {
      last = event;
      frame ||= requestAnimationFrame(paint);
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointermove', onMove);
    };
  }, []);

  const greeted = useRef(false);
  useEffect(() => {
    if (greeted.current) return;
    greeted.current = true;
    const art = [
      ' ____  _      _             ',
      '|  _ \\(_) ___| |_ _ __ ___  ',
      '| |_) | |/ _ \\ __| \'__/ _ \\ ',
      '|  __/| |  __/ |_| | | (_) |',
      '|_|   |_|\\___|\\__|_|  \\___/ ',
      '',
      '[bronze] -> [silver] -> [gold]',
    ].join('\n');
    console.log(`%c${art}`, 'color:#F0B94A;font-family:monospace');
    console.log(`${t.meta.consoleMessage} ${t.profile.github}`);
  }, [t]);
}

/** Botão flutuante do modo "navegar com a mão". */
function HandButton() {
  const { t, mounted } = useApp();
  const [state, setState] = useState<'idle' | 'open' | 'gone'>('idle');
  const button = useRef<HTMLButtonElement>(null);

  if (!mounted || state === 'gone') return null;
  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={() => setState('open')}
        aria-haspopup="dialog"
        title={t.hand.button}
        className={`group fixed right-4 bottom-24 z-30 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border bg-surface/90 px-3 md:hover:gap-2 md:focus-visible:gap-2 text-muted shadow-card backdrop-blur-md transition-colors duration-150 hover:border-gold hover:text-gold-ink md:right-6 md:bottom-6 ${
          state === 'open' ? 'invisible' : ''
        }`}
      >
        <Hand size={19} aria-hidden="true" />
        {/* Discreto: no desktop o rótulo só abre ao passar o mouse ou focar. */}
        <span className="text-small font-medium whitespace-nowrap max-md:sr-only md:max-w-0 md:overflow-hidden md:opacity-0 md:transition-[max-width,opacity] md:duration-[280ms] md:group-hover:max-w-64 md:group-hover:opacity-100 md:group-focus-visible:max-w-64 md:group-focus-visible:opacity-100">
          {t.hand.button}
        </span>
      </button>
      {state === 'open' && (
        <Suspense fallback={null}>
          <HandMode onClose={() => setState('idle')} onUnavailable={() => setState('gone')} />
        </Suspense>
      )}
    </>
  );
}

function Page() {
  const { t, overlay } = useApp();
  useSmallDetails();

  return (
    <>
      <a href="#conteudo" className="skip-link btn btn-primary">
        {t.ui.skipLink}
      </a>
      <Header />

      <main id="conteudo" tabIndex={-1} className="outline-none">
        <Hero />
        <Selector />
        {/* Referência de rolagem: a barra de abas pode estar fixa (celular) ou grudada (desktop). */}
        <div id="pipeline-anchor" />
        <Pipeline />
        <div className="container-page pt-10 md:pt-12">
          <Bronze />
          <Silver />
          <Gold />
          <Contact />
        </div>
      </main>

      <Footer />
      {/* Espaço para a bottom nav não cobrir o fim da página no celular. */}
      <div aria-hidden="true" className="h-[calc(72px+env(safe-area-inset-bottom))] md:hidden" />

      <HandButton />
      <Toasts />

      <AnimatePresence>
        {overlay === 'summary' && (
          <Suspense key="summary" fallback={null}>
            <SummaryCard />
          </Suspense>
        )}
        {overlay === 'terminal' && (
          <Suspense key="terminal" fallback={null}>
            <Terminal />
          </Suspense>
        )}
      </AnimatePresence>
    </>
  );
}

export function App({ initialLang }: { initialLang: Lang }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <AppProvider initialLang={initialLang}>
          <Page />
        </AppProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
