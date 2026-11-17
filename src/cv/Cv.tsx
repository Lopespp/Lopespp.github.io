import type { Content, SkillGroup } from '../content/types';
import { fill } from '../lib/text';
import { plain } from '../lib/RichText';

const base = import.meta.env.BASE_URL;
const GROUPS: SkillGroup[] = ['data', 'engineering', 'languages', 'ml', 'bi', 'tools'];
const short = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

/** Versão de impressão do conteúdo: uma página A4, sem animação. */
export function Cv({ content }: { content: Content }) {
  const { profile, cv, gold, silver } = content;
  const otherLang = content.lang === 'pt' ? 'en' : 'pt';

  return (
    <>
      <nav className="toolbar" aria-label={cv.pageTitle}>
        <a href={`${base}`}>← {cv.backToSite}</a>
        <span className="spacer" />
        <a href={`${base}cv.html?lang=${otherLang}&print=0`} lang={otherLang}>
          {cv.switchLanguage}
        </a>
        <button type="button" className="js-only" data-action="print">
          {cv.print}
        </button>
        <a className="primary" href={`${base}${cv.pdfFile}`} download>
          {cv.downloadPdf}
        </a>
      </nav>

      <main className="sheet">
        <header className="top">
          <img src={`${base}img/pietro-320.jpg`} alt={content.hero.photoAlt} width={72} height={72} />
          <div className="who">
            <h1>{profile.name}</h1>
            <p className="headline">{cv.headline}</p>
          </div>
          <ul className="contacts">
            <li>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </li>
            <li>
              <a href={profile.linkedin}>{short(profile.linkedin)}</a>
            </li>
            <li>
              <a href={profile.github}>{short(profile.github)}</a>
            </li>
            <li>{profile.city}</li>
          </ul>
        </header>

        <p className="summary">{cv.summary}</p>

        <div className="columns">
          <div className="main">
            <section>
              <h2>{cv.sections.experience}</h2>
              {gold.experiences.map((experience) => (
                <article key={experience.id}>
                  <div className="row">
                    <h3>
                      {experience.role} · {experience.company}
                      {experience.companyNote && <span className="note"> ({experience.companyNote})</span>}
                    </h3>
                    <span className="period">{experience.period}</span>
                  </div>
                  <p>{plain(experience.summary)}</p>
                  {experience.deliveries && experience.deliveries.length > 0 && (
                    <>
                      {experience.deliveriesTitle && <p className="sub">{experience.deliveriesTitle}</p>}
                      <ul className="bullets">
                        {experience.deliveries.map((delivery) => (
                          <li key={delivery.text}>{delivery.text}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  <p className="tags">{experience.tags.join(' · ')}</p>
                </article>
              ))}
            </section>

            <section>
              <h2>{cv.sections.certifications}</h2>
              <ul className="certs">
                <li>
                  <strong>{silver.certification.title}</strong>
                </li>
                {silver.badges.map((badge) => (
                  <li key={badge.title}>
                    {badge.title} <span className="note">({badge.kind})</span>
                  </li>
                ))}
              </ul>
              <p className="tags">
                {silver.wallets.map((wallet, index) => (
                  <span key={wallet.url}>
                    {index > 0 && ' · '}
                    <a href={wallet.url}>{short(wallet.url)}</a>
                  </span>
                ))}
              </p>
            </section>

            <section>
              <h2>{cv.sections.project}</h2>
              {gold.projects.map((project) => (
                <article key={project.id}>
                  <div className="row">
                    <h3>{project.name}</h3>
                    <span className="period">
                      <a href={project.primary.url}>{short(project.primary.url)}</a>
                    </span>
                  </div>
                  <p>{project.description}</p>
                  <p className="tags">{project.tags.join(' · ')}</p>
                </article>
              ))}
            </section>
          </div>

          <aside className="side">
            <section>
              <h2>{cv.sections.skills}</h2>
              {GROUPS.map((group) => {
                const skills = silver.skills.filter((skill) => skill.group === group);
                if (skills.length === 0) return null;
                return (
                  <div key={group} className="group">
                    <h3>{silver.groups[group]}</h3>
                    <p>{skills.map((skill) => skill.name).join(' · ')}</p>
                  </div>
                );
              })}
            </section>

            <section>
              <h2>{cv.sections.education}</h2>
              <div className="group">
                <h3>{silver.education.course}</h3>
                <p>
                  {silver.education.school} ·{' '}
                  {fill(silver.education.progressLabel, {
                    done: silver.education.done,
                    total: silver.education.total,
                  })}
                  <br />
                  {silver.education.expected}
                </p>
              </div>
              {silver.educationOther.map((item) => (
                <div key={item.title} className="group">
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </div>
              ))}
            </section>

            <section>
              <h2>{cv.sections.courses}</h2>
              <ul className="plain">
                {silver.courses.map((course) => (
                  <li key={course.title}>
                    <strong>{course.title}</strong>, {course.issuer}
                    {course.inProgress && ` (${content.ui.inProgress})`}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2>{cv.sections.languages}</h2>
              <ul className="plain">
                {silver.languages.map((language) => (
                  <li key={language.name}>
                    <strong>{language.name}</strong>: {language.level}
                    {language.note && `. ${language.note}`}
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
