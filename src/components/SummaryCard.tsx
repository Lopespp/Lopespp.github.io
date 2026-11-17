import { Copy, FileDown, X } from 'lucide-react';
import { m } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { copyText, selectText } from '../lib/clipboard';
import { useModal } from '../lib/hooks';
import { Icon } from '../lib/icons';
import { useApp } from '../state/app';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Card Resumo: o essencial em uma tela de celular, sem rolar. */
export default function SummaryCard() {
  const { t, cvUrl, closeOverlay, toast, reducedMotion } = useApp();
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const email = useRef<HTMLSpanElement>(null);
  useModal(dialog, closeOverlay, closeButton);

  const [showEmail, setShowEmail] = useState(false);

  const copy = async () => {
    if (await copyText(t.profile.email)) {
      toast(t.contact.copied);
    } else {
      // Sem acesso à área de transferência: mostra o e-mail já selecionado.
      setShowEmail(true);
      toast(t.contact.copyFailed);
    }
  };

  useEffect(() => {
    if (showEmail && email.current) selectText(email.current);
  }, [showEmail]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <m.div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={closeOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      />
      <m.div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="summary-title"
        tabIndex={-1}
        className="relative max-h-[100dvh] w-full overflow-y-auto rounded-t-[22px] border border-border bg-surface px-5 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))] shadow-card sm:max-w-md sm:rounded-[22px] sm:p-6"
        initial={{ opacity: 0, y: reducedMotion ? 0 : 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reducedMotion ? 0 : 24 }}
        transition={{ duration: reducedMotion ? 0.15 : 0.28, ease: EASE_OUT }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="label-mono !text-[0.6875rem] text-gold-ink">{t.summary.title}</p>
            <h2 id="summary-title" className="font-display text-lg leading-tight font-semibold">
              {t.profile.name} <span className="font-sans text-[0.9375rem] font-normal text-muted">· {t.profile.city}</span>
            </h2>
          </div>
          <button
            ref={closeButton}
            type="button"
            onClick={closeOverlay}
            aria-label={t.ui.close}
            className="icon-btn -mt-1.5 -mr-2 flex-none"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <dl className="mt-2 divide-y divide-border border-t border-border">
          {t.summary.items.map((item) => (
            <div key={item.label} className="py-1.5">
              <dt className="font-mono text-[0.6875rem] leading-tight tracking-[0.08em] text-muted uppercase">
                {item.label}
              </dt>
              <dd className="text-sm leading-snug text-text">{item.value}</dd>
            </div>
          ))}
        </dl>

        {showEmail && (
          <p className="mt-2 text-center font-mono text-sm break-all text-gold-ink">
            <span ref={email}>{t.profile.email}</span>
          </p>
        )}

        <div className="mt-3 grid grid-cols-2 gap-2">
          <a href={cvUrl} target="_blank" rel="noopener" className="btn btn-primary col-span-2">
            <FileDown size={18} aria-hidden="true" />
            {t.ui.downloadCv}
          </a>
          <a
            href={t.profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary !px-3 !text-sm"
          >
            <Icon name="linkedin" size={18} />
            {t.summary.linkedin}
          </a>
          <button type="button" onClick={copy} className="btn btn-secondary !px-3 !text-sm">
            <Copy size={18} aria-hidden="true" />
            {t.summary.copyEmail}
          </button>
        </div>
      </m.div>
    </div>
  );
}
