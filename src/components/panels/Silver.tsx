import { m, useInView } from 'framer-motion';
import { ArrowUpRight, BadgeCheck } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import type { Credential, SkillGroup } from '../../content/types';
import { useIsoLayoutEffect } from '../../lib/hooks';
import { fill } from '../../lib/text';
import { whereUsed } from '../../lib/usage';
import { useApp } from '../../state/app';
import { Reveal } from '../Reveal';
import { SkillChip } from '../SkillChip';
import { Panel, PanelBlock, SectionTitle } from './Panel';

const base = import.meta.env.BASE_URL;
const GROUPS: SkillGroup[] = ['data', 'engineering', 'languages', 'ml', 'bi', 'tools'];

/** Barra de semestres: vai de 0 até o progresso real ao entrar na tela. */
function Progress({ done, total, label }: { done: number; total: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' });
  const { reducedMotion } = useApp();
  const ratio = Math.max(0, Math.min(1, done / total));

  useIsoLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (node.offsetParent === null || node.getBoundingClientRect().top > window.innerHeight * 0.92) setArmed(true);
  }, []);

  const empty = armed && !inView && !reducedMotion;

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-valuetext={label}
      aria-label={label}
      className="h-2.5 overflow-hidden rounded-full bg-surface-2"
    >
      <m.div
        className="h-full origin-left rounded-full bg-layer"
        style={{ width: `${ratio * 100}%` }}
        initial={false}
        animate={{ scaleX: empty ? 0 : 1 }}
        transition={empty ? { duration: 0 } : { duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

/** Imagem de uma badge. É decorativa: o título vem sempre ao lado. */
function BadgeImage({ credential, size }: { credential: Credential; size: number }) {
  return (
    <picture className="flex-none">
      <source type="image/webp" srcSet={`${base}${credential.image}.webp`} />
      <img
        src={`${base}${credential.image}.png`}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        style={{ width: size, height: size }}
        className="object-contain"
      />
    </picture>
  );
}

export function Silver() {
  const { t } = useApp();
  const { silver } = t;
  const usage = useMemo(() => whereUsed(t), [t]);
  const progressLabel = fill(silver.education.progressLabel, {
    done: silver.education.done,
    total: silver.education.total,
  });

  return (
    <Panel id="silver" title={silver.title}>
      <PanelBlock className="mt-8">
        <section aria-labelledby="skills-title">
          <SectionTitle id="skills-title">{silver.skillsTitle}</SectionTitle>
          <p className="text-small mt-1 text-muted">{silver.skillsHint}</p>
          <p className="text-small mt-1 flex items-center gap-2 text-muted">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-layer" />
            {silver.dailyLegend}
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {GROUPS.map((group) => {
              const skills = silver.skills.filter((skill) => skill.group === group);
              if (skills.length === 0) return null;
              return (
                <div key={group} className="card p-5">
                  <h4 className="label-mono text-layer-ink">{silver.groups[group]}</h4>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <li key={skill.id}>
                        <SkillChip
                          skill={skill}
                          usedIn={usage.get(skill.id) ?? []}
                          usedLabel={silver.whereUsed}
                          dailyLabel={silver.dailyLegend}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      </PanelBlock>

      <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-12">
        <PanelBlock>
          <section aria-labelledby="certs-title">
            <SectionTitle id="certs-title">{silver.certsTitle}</SectionTitle>

            <Reveal className="card cert-card mt-5 flex items-center gap-4 p-5 md:gap-5">
              <BadgeImage credential={silver.certification} size={104} />
              <div className="min-w-0">
                <p className="label-mono text-layer-ink">{silver.certification.kind}</p>
                <p className="font-display mt-1 text-lg leading-snug font-semibold md:text-xl">
                  {silver.certification.title}
                </p>
                <p className="text-small mt-1 text-muted">{silver.certification.text}</p>
              </div>
            </Reveal>

            <h4 className="font-display mt-8 text-base font-semibold">{silver.badgesTitle}</h4>
            <p className="text-small mt-1 text-muted">{silver.badgesText}</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {silver.badges.map((badge, index) => (
                <Reveal as="li" key={badge.title} delay={index * 0.04} className="card badge-card flex items-center gap-3 p-3.5">
                  <BadgeImage credential={badge} size={64} />
                  <div className="min-w-0">
                    <p className="font-mono text-[0.6875rem] leading-tight tracking-[0.06em] text-muted uppercase">
                      {badge.kind}
                    </p>
                    <p className="text-small mt-0.5 leading-snug font-medium text-text">{badge.title}</p>
                  </div>
                </Reveal>
              ))}
            </ul>

            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
              {silver.wallets.map((wallet) => (
                <li key={wallet.url}>
                  <a
                    href={wallet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link text-small inline-flex min-h-11 items-center gap-1 font-medium"
                  >
                    {wallet.label}
                    <ArrowUpRight size={15} aria-hidden="true" className="nudge-up" />
                    <span className="sr-only">({t.ui.opensInNewTab})</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </PanelBlock>

        <PanelBlock className="space-y-10">
          <section aria-labelledby="education-title">
            <SectionTitle id="education-title">{silver.educationTitle}</SectionTitle>
            <Reveal className="card mt-5 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="font-display text-lg font-semibold">{silver.education.course}</p>
                <p className="text-muted">{silver.education.school}</p>
              </div>
              <div className="mt-4">
                <Progress done={silver.education.done} total={silver.education.total} label={progressLabel} />
              </div>
              <div className="text-small mt-2.5 flex flex-wrap justify-between gap-x-4 gap-y-1 text-muted">
                <span className="font-medium text-text">{progressLabel}</span>
                <span>{silver.education.expected}</span>
              </div>
            </Reveal>
            {silver.educationOther.length > 0 && (
              <ul className="mt-3 space-y-2">
                {silver.educationOther.map((item) => (
                  <li key={item.title} className="flex flex-wrap items-baseline justify-between gap-x-4 px-1">
                    <span className="font-medium text-text">{item.title}</span>
                    <span className="text-small text-muted">{item.detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="languages-title">
            <SectionTitle id="languages-title">{silver.languagesTitle}</SectionTitle>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {silver.languages.map((language, index) => (
                <Reveal as="li" key={language.name} delay={index * 0.04} className="card p-5">
                  <p className="font-display text-lg font-semibold">{language.name}</p>
                  <p className="mt-1 font-medium text-layer-ink">{language.level}</p>
                  {language.note && <p className="text-small text-muted">{language.note}</p>}
                </Reveal>
              ))}
            </ul>
          </section>

          <section aria-labelledby="courses-title">
            <SectionTitle id="courses-title">{silver.coursesTitle}</SectionTitle>
            <ul className="mt-5 space-y-3">
              {silver.courses.map((course, index) => (
                <Reveal as="li" key={course.title} delay={index * 0.04} className="flex items-start gap-3">
                  <BadgeCheck size={19} aria-hidden="true" className="mt-0.5 flex-none text-layer-ink" />
                  <p className="min-w-0">
                    <span className="font-medium text-text">{course.title}</span>
                    <span className="text-muted">
                      {' · '}
                      {course.issuer}
                    </span>
                    {course.inProgress && <span className="tag ml-2 align-middle">{t.ui.inProgress}</span>}
                  </p>
                </Reveal>
              ))}
            </ul>
          </section>
        </PanelBlock>
      </div>
    </Panel>
  );
}
