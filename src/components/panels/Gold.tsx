import { CodeXml, Play } from 'lucide-react';
import type { Experience, Project } from '../../content/types';
import { Icon } from '../../lib/icons';
import { RichText } from '../../lib/RichText';
import { useApp } from '../../state/app';
import { ProjectImage } from '../ProjectImage';
import { Reveal } from '../Reveal';
import { Tilt } from '../Tilt';
import { Panel, PanelBlock, SectionTitle } from './Panel';

const base = import.meta.env.BASE_URL;

function Tags({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item} className="tag">
          {item}
        </li>
      ))}
    </ul>
  );
}

function FeaturedProject({ project }: { project: Project }) {
  const { t } = useApp();
  return (
    <Tilt max={4}>
      <article className="card card-hover relative grid overflow-hidden lg:grid-cols-2">
        <div className="relative border-b border-border lg:border-r lg:border-b-0">
          <ProjectImage path={project.image} alt={project.imageAlt} name={project.name} />
        </div>

        <div className="relative flex flex-col p-5 md:p-7">
          {project.mascot && (
            <picture>
              <source type="image/webp" srcSet={`${base}${project.mascot}.webp`} />
              <img
                src={`${base}${project.mascot}.png`}
                alt=""
                width={256}
                height={194}
                loading="lazy"
                decoding="async"
                className="bob pointer-events-none absolute top-4 right-4 h-auto w-16 md:w-20"
                style={{ imageRendering: 'pixelated' }}
              />
            </picture>
          )}
          <p className="label-mono pr-20 text-gold-ink md:pr-24">{project.label}</p>
          <h4 className="font-display mt-1 pr-20 text-2xl font-bold md:pr-24 md:text-3xl">{project.name}</h4>
          <p className="mt-4 text-muted">{project.description}</p>
          <div className="mt-5">
            <Tags items={project.tags} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={project.primary.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              <Play size={17} aria-hidden="true" />
              {project.primary.label}
              <span className="sr-only">({t.ui.opensInNewTab})</span>
            </a>
            {project.secondary && (
              <a href={project.secondary.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                <CodeXml size={17} aria-hidden="true" />
                {project.secondary.label}
                <span className="sr-only">({t.ui.opensInNewTab})</span>
              </a>
            )}
          </div>
        </div>
      </article>
    </Tilt>
  );
}

function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <article className="card card-hover p-5 md:p-7">
      <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <div className="min-w-0">
          <h4 className="font-display text-xl font-semibold">
            {experience.company}
            {experience.companyNote && (
              <span className="font-sans text-base font-normal text-muted"> ({experience.companyNote})</span>
            )}
          </h4>
          <p className="font-medium text-gold-ink">{experience.role}</p>
        </div>
        <p className="label-mono text-muted">{experience.period}</p>
      </header>

      <p className="mt-4 text-muted">
        <RichText text={experience.summary} />
      </p>

      {experience.deliveries && experience.deliveries.length > 0 && (
        <div className="mt-5">
          {experience.deliveriesTitle && <h5 className="label-mono text-text">{experience.deliveriesTitle}</h5>}
          <ul className="mt-3 space-y-2.5">
            {experience.deliveries.map((delivery) => (
              <li key={delivery.text} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-7 flex-none items-center justify-center rounded-full bg-gold/15 text-gold-ink">
                  <Icon name={delivery.icon} size={15} />
                </span>
                <span className="text-small min-w-0 pt-0.5 text-text">{delivery.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5">
        <Tags items={experience.tags} />
      </div>
    </article>
  );
}

export function Gold() {
  const { t } = useApp();
  const { gold } = t;

  return (
    <Panel id="gold" title={gold.title}>
      <PanelBlock className="mt-8">
        <section aria-labelledby="featured-title">
          <SectionTitle id="featured-title">{gold.featuredTitle}</SectionTitle>
          <div className="mt-5 space-y-6">
            {gold.projects.map((project) => (
              <FeaturedProject key={project.id} project={project} />
            ))}
          </div>
        </section>
      </PanelBlock>

      <PanelBlock className="mt-14">
        <section aria-labelledby="experience-title">
          <SectionTitle id="experience-title">{gold.experienceTitle}</SectionTitle>
          <ol className="mt-5 space-y-6">
            {gold.experiences.map((experience, index) => (
              <Reveal as="li" key={experience.id} delay={index * 0.04}>
                <ExperienceCard experience={experience} />
              </Reveal>
            ))}
          </ol>
        </section>
      </PanelBlock>
    </Panel>
  );
}

