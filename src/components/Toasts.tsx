import { useApp } from '../state/app';

/** Avisos curtos (2s), anunciados por leitores de tela. */
export function Toasts() {
  const { toasts } = useApp();
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4 md:bottom-8"
    >
      {toasts.map((item) => (
        <p
          key={item.id}
          className="text-small max-w-sm rounded-full border border-border bg-surface-2 px-4 py-2.5 text-center font-medium text-text shadow-card"
        >
          {item.message}
        </p>
      ))}
    </div>
  );
}
