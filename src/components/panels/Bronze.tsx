import { Construction } from 'lucide-react';
import { Icon } from '../../lib/icons';
import { RichText } from '../../lib/RichText';
import { useApp } from '../../state/app';
import { Reveal } from '../Reveal';
import { Panel, PanelBlock, SectionTitle } from './Panel';

export function Bronze() {
  const { t } = useApp();
  const { bronze } = t;

  return (
    <Panel id="bronze" title={bronze.title}>
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
        <PanelBlock className="space-y-5 text-muted">
          {bronze.bio.map((paragraph) => (
            <p key={paragraph}>
              <RichText text={paragraph} />
            </p>
          ))}
        </PanelBlock>

        <PanelBlock>
          <section aria-labelledby="timeline-title">
            <SectionTitle id="timeline-title">{bronze.timelineTitle}</SectionTitle>
            <ol className="mt-5">
              {bronze.timeline.map((item, index) => {
                const last = index === bronze.timeline.length - 1;
                return (
                  <Reveal as="li" key={item.date} delay={index * 0.04} className="relative flex gap-4 pb-6 last:pb-0">
                    {!last && (
                      <span
                        aria-hidden="true"
                        className={`absolute top-4 bottom-0 left-[5px] border-l ${
                          bronze.timeline[index + 1]?.upcoming ? 'border-dashed border-muted' : 'border-border'
                        }`}
                      >
                        {/* A linha se pinta de bronze conforme a rolagem passa por ela. */}
                        {!bronze.timeline[index + 1]?.upcoming && <span className="timeline-fill" />}
                      </span>
                    )}
                    <span
                      aria-hidden="true"
                      className={`relative mt-1.5 size-[11px] flex-none rounded-full border-2 ${
                        item.upcoming ? 'border-dashed border-muted bg-bg' : 'border-bronze bg-bronze'
                      }`}
                    />
                    <div
                      className={`min-w-0 flex-1 ${
                        item.upcoming ? 'rounded-[14px] border border-dashed border-muted/60 px-4 py-3' : ''
                      }`}
                    >
                      <p className="label-mono text-bronze-ink">{item.date}</p>
                      <p className="mt-1 text-text">{item.text}</p>
                      {item.badge && (
                        <p className="text-small mt-2 inline-flex items-center gap-1.5 text-muted">
                          <Construction size={15} aria-hidden="true" />
                          {item.badge}
                        </p>
                      )}
                    </div>
                  </Reveal>
                );
              })}
            </ol>
          </section>
        </PanelBlock>
      </div>

      <PanelBlock className="mt-14">
        <section aria-labelledby="offcode-title">
          <SectionTitle id="offcode-title">{bronze.offCodeTitle}</SectionTitle>
          <ul className="mt-4 flex flex-wrap gap-2.5">
            {bronze.offCode.map((item) => (
              <li
                key={item.title}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-[0.9375rem] text-text"
              >
                <Icon name={item.icon} size={17} className="flex-none text-bronze-ink" />
                {item.title}
              </li>
            ))}
          </ul>
        </section>
      </PanelBlock>
    </Panel>
  );
}
