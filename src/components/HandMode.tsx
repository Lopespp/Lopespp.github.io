import { Hand, X } from 'lucide-react';
import { m } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useModal } from '../lib/hooks';
import { HandTrackingError, startHandTracking, type HandReading, type HandTracker } from '../lib/handTracking';
import { useApp } from '../state/app';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Zona morta no meio do quadro: a mão parada ali não rola a página. */
const DEAD_ZONE = 0.12;
const MAX_SPEED = 1100; // px por segundo
const FIST_HOLD_MS = 220;
const FIST_COOLDOWN_MS = 1300;
const PEACE_HOLD_MS = 500;

function Explain({ onActivate, onDismiss }: { onActivate: () => void; onDismiss: () => void }) {
  const { t, reducedMotion } = useApp();
  const dialog = useRef<HTMLDivElement>(null);
  useModal(dialog, onDismiss);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <m.div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onDismiss}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      />
      <m.div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hand-title"
        aria-describedby="hand-text"
        tabIndex={-1}
        className="relative w-full rounded-t-[22px] border border-border bg-surface p-6 pb-[calc(24px+env(safe-area-inset-bottom))] shadow-card sm:max-w-md sm:rounded-[22px] sm:pb-6"
        initial={{ opacity: 0, y: reducedMotion ? 0 : 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0.15 : 0.28, ease: EASE_OUT }}
      >
        <h2 id="hand-title" className="text-h3 flex items-center gap-2.5">
          <Hand size={22} aria-hidden="true" className="text-gold-ink" />
          {t.hand.title}
        </h2>
        <p id="hand-text" className="mt-3 text-muted">
          {t.hand.explain}
        </p>
        <ul className="text-small mt-4 space-y-1.5 text-text">
          {t.hand.gestures.map((gesture) => (
            <li key={gesture.text} className="flex gap-2.5">
              <span aria-hidden="true">{gesture.emoji}</span>
              <span>{gesture.text}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={onActivate} className="btn btn-primary flex-1">
            {t.hand.activate}
          </button>
          <button type="button" onClick={onDismiss} className="btn btn-secondary flex-1">
            {t.hand.notNow}
          </button>
        </div>
      </m.div>
    </div>
  );
}

interface HandModeProps {
  /** Fecha o modo e devolve o botão flutuante. */
  onClose: () => void;
  /** Câmera negada ou inexistente: o botão some de vez. */
  onUnavailable: () => void;
}

export default function HandMode({ onClose, onUnavailable }: HandModeProps) {
  const { t, toast, nextTab } = useApp();
  const [phase, setPhase] = useState<'explain' | 'loading' | 'active'>('explain');
  const [gesture, setGesture] = useState<'none' | 'open' | 'fist' | 'peace'>('none');
  const video = useRef<HTMLVideoElement>(null);
  const tracker = useRef<HandTracker | null>(null);
  const reading = useRef<HandReading>({ y: null, fist: false, peace: false });
  const cancelled = useRef(false);

  const stop = useCallback(
    (message?: string) => {
      cancelled.current = true;
      tracker.current?.stop();
      tracker.current = null;
      if (message) toast(message, 3000);
      onClose();
    },
    [onClose, toast],
  );

  const activate = async () => {
    setPhase('loading');
    try {
      if (!video.current) throw new HandTrackingError('failed');
      const started = await startHandTracking(video.current, (next) => {
        reading.current = next;
      });
      if (cancelled.current) {
        started.stop();
        return;
      }
      tracker.current = started;
      setPhase('active');
    } catch (error) {
      if (cancelled.current) return;
      const reason = error instanceof HandTrackingError ? error.reason : 'failed';
      toast(t.hand[reason], 6000);
      if (reason === 'failed') onClose();
      else onUnavailable();
    }
  };

  // As ações mudam de identidade a cada troca de aba. O laço abaixo lê sempre a
  // versão mais recente por esta ref, para não reiniciar (e perder o estado do
  // gesto em andamento) toda vez que a aba muda.
  const actions = useRef({ nextTab, stop, turnedOff: t.hand.turnedOff });
  useEffect(() => {
    actions.current = { nextTab, stop, turnedOff: t.hand.turnedOff };
  });

  // Traduz as leituras em ações: rolar, próxima aba, desligar.
  useEffect(() => {
    if (phase !== 'active') return;
    let frame = 0;
    let last = performance.now();
    let fistSince = 0;
    let fistFired = false;
    let lastFist = 0;
    let peaceSince = 0;
    let shown: typeof gesture = 'none';

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const { y, fist, peace } = reading.current;
      const current = y === null ? 'none' : peace ? 'peace' : fist ? 'fist' : 'open';
      if (current !== shown) {
        shown = current;
        setGesture(current);
      }

      if (peace) {
        peaceSince ||= now;
        if (now - peaceSince > PEACE_HOLD_MS) {
          actions.current.stop(actions.current.turnedOff);
          return;
        }
      } else {
        peaceSince = 0;
      }

      if (fist) {
        fistSince ||= now;
        if (!fistFired && now - fistSince > FIST_HOLD_MS && now - lastFist > FIST_COOLDOWN_MS) {
          fistFired = true;
          lastFist = now;
          actions.current.nextTab();
        }
      } else {
        fistSince = 0;
        fistFired = false;
      }

      if (current === 'open' && y !== null) {
        const offset = y - 0.5;
        if (Math.abs(offset) > DEAD_ZONE) {
          const strength = Math.min(1, (Math.abs(offset) - DEAD_ZONE) / (0.5 - DEAD_ZONE - 0.08));
          window.scrollBy({ top: Math.sign(offset) * strength * MAX_SPEED * dt, behavior: 'instant' });
        }
      }
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  // Garante que a câmera é liberada se o componente sair da tela.
  useEffect(
    () => () => {
      cancelled.current = true;
      tracker.current?.stop();
    },
    [],
  );

  const emoji = { none: '…', open: '✋', fist: '✊', peace: '✌️' }[gesture];

  return (
    <>
      {phase === 'explain' && <Explain onActivate={activate} onDismiss={() => stop()} />}

      <div
        className={`fixed bottom-24 left-4 z-40 w-44 overflow-hidden rounded-[14px] border border-border bg-surface shadow-card md:bottom-6 md:left-6 ${
          phase === 'explain' ? 'hidden' : ''
        }`}
      >
        <div className="relative aspect-[4/3] bg-surface-2">
          <video
            ref={video}
            muted
            playsInline
            aria-label={t.hand.previewLabel}
            className="size-full -scale-x-100 object-cover"
          />
          {phase === 'active' && (
            <span
              aria-hidden="true"
              className="absolute top-1.5 right-1.5 flex size-8 items-center justify-center rounded-full bg-black/60 text-base"
            >
              {emoji}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 py-1 pr-1 pl-3">
          <p role="status" className="text-xs leading-tight font-medium text-text">
            {phase === 'loading' ? t.hand.loading : t.hand.active}
          </p>
          <button type="button" onClick={() => stop()} aria-label={t.hand.stop} className="icon-btn flex-none">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
}
