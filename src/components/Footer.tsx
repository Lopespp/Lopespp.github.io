import { ChevronDown, Mail, ShieldCheck, Terminal as TerminalIcon } from 'lucide-react';
import { Icon } from '../lib/icons';
import { useApp } from '../state/app';

export function Footer() {
  const { t, openOverlay } = useApp();
  const { profile } = t;

  return (
    <footer className="mt-24 border-t border-border">
      <div className="container-page pt-5">
        <details className="privacy">
          <summary>
            <ShieldCheck size={16} aria-hidden="true" />
            {t.footer.privacyTitle}
            <ChevronDown size={15} aria-hidden="true" className="privacy-chevron transition-transform duration-150" />
          </summary>
          <ul className="text-small mt-1 max-w-3xl list-disc space-y-1 pb-2 pl-5 text-muted">
            {t.footer.privacy.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </details>
      </div>
      <div className="container-page flex flex-col gap-4 pt-3 pb-8 md:flex-row md:items-center md:justify-between md:pb-24">
        <div>
          <p className="text-small text-muted">{t.footer.text}</p>
          <button
            type="button"
            onClick={() => openOverlay('terminal')}
            aria-haspopup="dialog"
            title={t.footer.openTerminal}
            className="js-only -ml-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 font-mono text-xs text-muted transition-colors duration-150 hover:text-gold-ink"
          >
            <TerminalIcon size={15} aria-hidden="true" />
            <span>{t.footer.terminalHint}</span>
          </button>
        </div>

        <ul className="-ml-3 flex items-center gap-1 md:ml-0">
          <li>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t.contact.githubTitle} (${t.ui.opensInNewTab})`}
              className="icon-btn"
            >
              <Icon name="github" size={20} />
            </a>
          </li>
          <li>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t.contact.linkedinTitle} (${t.ui.opensInNewTab})`}
              className="icon-btn"
            >
              <Icon name="linkedin" size={20} />
            </a>
          </li>
          <li>
            <a href={`mailto:${profile.email}`} aria-label={t.footer.emailLabel} className="icon-btn">
              <Mail size={20} aria-hidden="true" />
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
