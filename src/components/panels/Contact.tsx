import { ArrowUpRight, Copy, FileDown, Mail } from 'lucide-react';
import { useRef } from 'react';
import { copyText, selectText } from '../../lib/clipboard';
import { Icon } from '../../lib/icons';
import { useApp } from '../../state/app';
import { Reveal } from '../Reveal';
import { Panel, PanelBlock } from './Panel';

export function Contact() {
  const { t, toast, pdfUrl } = useApp();
  const { contact, profile } = t;
  const email = useRef<HTMLSpanElement>(null);

  const copy = async () => {
    if (await copyText(profile.email)) {
      toast(contact.copied);
    } else {
      if (email.current) selectText(email.current);
      toast(contact.copyFailed);
    }
  };

  const cardClass = 'card card-hover flex h-full items-center gap-4 p-5 md:p-6';
  const iconClass = 'flex size-12 flex-none items-center justify-center rounded-[14px] bg-layer/15 text-layer-ink';

  return (
    <Panel id="contato" title={contact.title}>
      <PanelBlock>
        <p className="mt-4 max-w-2xl text-muted">{contact.text}</p>
      </PanelBlock>

      <PanelBlock className="mt-8">
        <ul className="grid gap-4 md:grid-cols-2">
          <Reveal as="li">
            <div className={cardClass}>
              <span className={iconClass}>
                <Mail size={24} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="label-mono text-muted">{contact.emailTitle}</p>
                <button
                  type="button"
                  onClick={copy}
                  aria-label={`${contact.emailCopy}: ${profile.email}`}
                  className="font-display inline-flex min-h-11 items-center gap-2.5 text-left text-lg font-semibold break-all transition-colors duration-150 hover:text-gold-ink"
                >
                  <span ref={email}>{profile.email}</span>
                  <Copy size={17} aria-hidden="true" className="js-only flex-none text-muted" />
                </button>
                <p>
                  <a href={`mailto:${profile.email}`} className="link text-small inline-flex min-h-11 items-center">
                    {contact.emailWrite}
                  </a>
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal as="li" delay={0.04}>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className={cardClass}>
              <span className={iconClass}>
                <Icon name="linkedin" size={24} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-display block text-lg font-semibold">{contact.linkedinTitle}</span>
                <span className="text-small block text-muted">{contact.linkedinText}</span>
              </span>
              <ArrowUpRight size={20} aria-hidden="true" className="nudge-up flex-none text-muted" />
              <span className="sr-only">({t.ui.opensInNewTab})</span>
            </a>
          </Reveal>

          <Reveal as="li" delay={0.08}>
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className={cardClass}>
              <span className={iconClass}>
                <Icon name="github" size={24} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-display block text-lg font-semibold">{contact.githubTitle}</span>
                <span className="text-small block text-muted">{contact.githubText}</span>
              </span>
              <ArrowUpRight size={20} aria-hidden="true" className="nudge-up flex-none text-muted" />
              <span className="sr-only">({t.ui.opensInNewTab})</span>
            </a>
          </Reveal>

          <Reveal as="li" delay={0.12}>
            <a href={pdfUrl} download className={cardClass}>
              <span className={iconClass}>
                <FileDown size={24} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-display block text-lg font-semibold">{contact.cvTitle}</span>
                <span className="text-small block text-muted">{contact.cvText}</span>
              </span>
            </a>
          </Reveal>
        </ul>
      </PanelBlock>
    </Panel>
  );
}
