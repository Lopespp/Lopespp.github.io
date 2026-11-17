import { FileDown, Moon, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { LANGS } from '../content';
import { useApp } from '../state/app';

export function Header() {
  const { t, lang, setLang, theme, toggleTheme, cvUrl } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const progress = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
      // Barra de progresso: quanto da página já foi rolado.
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (progress.current) progress.current.style.transform = `scaleX(${ratio})`;
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 h-16 border-b transition-[background-color,border-color,backdrop-filter] duration-[280ms] ease-out ${
        scrolled
          ? 'border-border bg-surface/85 backdrop-blur-md'
          : 'border-transparent bg-transparent'
      }`}
    >
      <span ref={progress} aria-hidden="true" className="scroll-progress js-only" />
      <div className="container-page flex h-full items-center justify-end gap-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <div
            role="group"
            aria-label={t.ui.languageToggle}
            className="js-only flex items-center rounded-full border border-border bg-surface p-0.5"
          >
            {LANGS.map((code) => (
              <button
                key={code}
                type="button"
                lang={code}
                aria-pressed={lang === code}
                aria-label={`${code.toUpperCase()}: ${t.ui.languageNames[code]}`}
                onClick={() => setLang(code)}
                className={`min-h-11 min-w-11 rounded-full px-2 font-mono text-[0.8125rem] font-medium uppercase tracking-[0.08em] transition-colors duration-150 ${
                  lang === code ? 'bg-surface-2 text-gold-ink' : 'text-muted hover:text-text'
                }`}
              >
                {code}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={(event) => toggleTheme(event.currentTarget)}
            aria-label={theme === 'dark' ? t.ui.themeToLight : t.ui.themeToDark}
            className="icon-btn js-only"
          >
            {theme === 'dark' ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
          </button>

          <a
            href={cvUrl}
            target="_blank"
            rel="noopener"
            aria-label={`${t.ui.downloadCv} (${t.ui.opensInNewTab})`}
            className="btn btn-primary !min-h-11 !px-4"
          >
            <FileDown size={18} aria-hidden="true" />
            <span className="max-sm:hidden">{t.ui.downloadCv}</span>
            <span className="sm:hidden" aria-hidden="true">
              {t.ui.cvShort}
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
