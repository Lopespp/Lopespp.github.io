import { X } from 'lucide-react';
import { m } from 'framer-motion';
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { contents, isLang } from '../content';
import type { Content } from '../content/types';
import { fill } from '../lib/text';
import { useModal } from '../lib/hooks';
import { whereUsed } from '../lib/usage';
import { useApp } from '../state/app';

const PROMPT = 'pietro@lakehouse:~$';
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

interface Line {
  id: number;
  node: ReactNode;
}

/** Tabela ASCII no estilo de um cliente SQL. */
function asciiTable(table: Content['terminal']['table']): string {
  const rows = table.rows.map((row) => [row.field, row.value]);
  const widths = [0, 1].map((column) =>
    Math.max(column === 0 ? table.field.length : table.value.length, ...rows.map((row) => row[column].length)),
  );
  const rule = `+${widths.map((width) => '-'.repeat(width + 2)).join('+')}+`;
  const format = (cells: string[]) => `| ${cells.map((cell, column) => cell.padEnd(widths[column])).join(' | ')} |`;
  return [rule, format([table.field, table.value]), rule, ...rows.map(format), rule].join('\n');
}

const normalize = (command: string) => command.trim().replace(/;$/, '').replace(/\s+/g, ' ').toLowerCase();

export default function Terminal() {
  const { t, lang, setLang, theme, setTheme, goToTab, closeOverlay, reducedMotion } = useApp();
  const dialog = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const counter = useRef(0);
  const [value, setValue] = useState('');
  const [lines, setLines] = useState<Line[]>(() =>
    t.terminal.welcome.map((text, index) => ({ id: -index - 1, node: <span className="text-muted">{text}</span> })),
  );
  const history = useRef<string[]>([]);
  const cursor = useRef(0);
  useModal(dialog, closeOverlay, input);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [lines]);

  const names = t.terminal.commands.map((command) => command.name);

  const linkClass = 'link';
  const external = (href: string, label: string) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {label}
    </a>
  );
  const tabLink = (tab: 'silver' | 'gold' | 'contato', label: string) => (
    <a
      href={`#${tab}`}
      className={linkClass}
      onClick={(event) => {
        event.preventDefault();
        closeOverlay();
        goToTab(tab, { scroll: true });
      }}
    >
      {label}
    </a>
  );

  const run = (raw: string): ReactNode | 'clear' | 'exit' => {
    const command = normalize(raw);
    const [name, argument] = command.split(' ');
    const text = contents[lang].terminal;

    if (command === 'help') {
      return (
        <ul>
          {text.commands.map((item) => (
            <li key={item.name} className="flex flex-wrap gap-x-3">
              <span className="min-w-[13.5rem] text-gold-ink">{item.name}</span>
              <span className="text-muted">{item.description}</span>
            </li>
          ))}
        </ul>
      );
    }
    if (command === 'whoami') {
      return (
        <>
          {text.whoami.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </>
      );
    }
    if (command === 'select * from pietro') {
      return (
        <>
          <pre className="overflow-x-auto leading-snug">{asciiTable(text.table)}</pre>
          <p className="text-muted">{text.rowCount}</p>
        </>
      );
    }
    if (command === 'skills') {
      const usage = whereUsed(t);
      return (
        <>
          <p className="text-muted">{text.skillsIntro}</p>
          <ul>
            {t.silver.skills
              .filter((skill) => skill.daily)
              .map((skill) => (
                <li key={skill.id}>
                  {'- '}
                  {skill.name}
                  {usage.get(skill.id) && <span className="text-muted">{` → ${usage.get(skill.id)!.join(', ')}`}</span>}
                </li>
              ))}
          </ul>
          <p>{tabLink('silver', `→ ${t.tabs.items.silver.label}`)}</p>
        </>
      );
    }
    if (command === 'certs') {
      return (
        <>
          <p className="text-muted">{text.certsIntro}</p>
          <ul>
            <li>{`- ${t.silver.certification.title}`}</li>
            {t.silver.badges.map((badge) => (
              <li key={badge.title}>
                {`- ${badge.title} `}
                <span className="text-muted">{`(${badge.kind})`}</span>
              </li>
            ))}
          </ul>
          {t.silver.wallets.map((wallet) => (
            <p key={wallet.url}>
              {'→ '}
              {external(wallet.url, wallet.label)}
            </p>
          ))}
        </>
      );
    }
    if (command === 'projects') {
      return (
        <>
          <p className="text-muted">{text.projectsIntro}</p>
          <ul>
            {t.gold.projects.map((project) => (
              <li key={project.id}>
                {'- '}
                {project.name}
                {': '}
                {external(project.primary.url, project.primary.label)}
                {project.secondary && (
                  <>
                    {' · '}
                    {external(project.secondary.url, project.secondary.label)}
                  </>
                )}
              </li>
            ))}
            {t.gold.experiences.flatMap((experience) =>
              (experience.deliveries ?? []).map((delivery) => <li key={delivery.short}>{`- ${delivery.short}`}</li>),
            )}
          </ul>
          <p>{tabLink('gold', `→ ${t.tabs.items.gold.label}`)}</p>
        </>
      );
    }
    if (command === 'play') {
      const project = t.gold.projects[0];
      if (project) window.open(project.primary.url, '_blank', 'noopener');
      return <p>{text.playing}</p>;
    }
    if (command === 'contact') {
      return (
        <>
          <p className="text-muted">{text.contactIntro}</p>
          <p>
            {'- '}
            <a href={`mailto:${t.profile.email}`} className={linkClass}>
              {t.profile.email}
            </a>
          </p>
          <p>
            {'- '}
            {external(t.profile.linkedin, t.profile.linkedin.replace('https://www.', ''))}
          </p>
        </>
      );
    }
    if (command === 'theme') {
      const next = theme === 'dark' ? 'light' : 'dark';
      setTheme(next);
      return <p>{text.themeChanged[next]}</p>;
    }
    if (name === 'lang') {
      if (!isLang(argument)) return <p>{text.langUsage}</p>;
      setLang(argument);
      return <p>{contents[argument].terminal.langChanged}</p>;
    }
    if (command === 'clear') return 'clear';
    if (command === 'exit') return 'exit';
    return <p>{fill(text.notFound, { cmd: raw.trim() })}</p>;
  };

  const submit = () => {
    const raw = value;
    setValue('');
    if (!raw.trim()) return;
    history.current.push(raw);
    cursor.current = history.current.length;
    const output = run(raw);
    if (output === 'exit') {
      closeOverlay();
      return;
    }
    if (output === 'clear') {
      setLines([]);
      return;
    }
    counter.current += 2;
    const id = counter.current;
    setLines((current) => [
      ...current,
      {
        id,
        node: (
          <p>
            <span className="text-success-ink">{PROMPT}</span> {raw}
          </p>
        ),
      },
      { id: id + 1, node: output },
    ]);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submit();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (history.current.length === 0) return;
      cursor.current = Math.max(0, cursor.current - 1);
      setValue(history.current[cursor.current]);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      cursor.current = Math.min(history.current.length, cursor.current + 1);
      setValue(history.current[cursor.current] ?? '');
    } else if (event.key === 'Tab' && value.trim()) {
      // Autocomplete: completa quando só um comando começa com o que foi digitado.
      const typed = value.trimStart().toLowerCase();
      const matches = names.filter((name) => name.toLowerCase().startsWith(typed));
      if (matches.length === 0) return;
      event.preventDefault();
      event.stopPropagation();
      if (matches.length === 1) {
        setValue(matches[0]);
      } else {
        counter.current += 1;
        setLines((current) => [
          ...current,
          { id: counter.current, node: <p className="text-muted">{matches.join('   ')}</p> },
        ]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
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
        aria-labelledby="terminal-title"
        tabIndex={-1}
        onClick={() => {
          if (!window.getSelection()?.toString()) input.current?.focus();
        }}
        className="relative flex h-[min(34rem,85dvh)] w-full flex-col overflow-hidden rounded-t-[14px] border border-border bg-surface-2 font-mono text-[0.8125rem] leading-relaxed text-text shadow-card sm:max-w-3xl sm:rounded-[14px]"
        initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
        transition={{ duration: reducedMotion ? 0.15 : 0.28, ease: EASE_OUT }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border py-1 pr-1 pl-4">
          <h2 id="terminal-title" className="flex items-center gap-3 text-muted">
            <span>{t.terminal.title}</span>
            <span className="inline-flex items-center gap-1.5 text-success-ink">
              <span className="size-2 rounded-full bg-success" aria-hidden="true" />
              {t.terminal.status}
            </span>
          </h2>
          <button type="button" onClick={closeOverlay} aria-label={t.ui.close} className="icon-btn">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div ref={scroller} className="flex-1 overflow-y-auto px-4 py-3">
          <div aria-live="polite" className="space-y-1.5 break-words">
            {lines.map((line) => (
              <div key={line.id}>{line.node}</div>
            ))}
          </div>
          <label className="mt-1.5 flex items-center gap-2">
            <span className="flex-none text-success-ink" aria-hidden="true">
              {PROMPT}
            </span>
            <span className="sr-only">{t.terminal.inputLabel}</span>
            <input
              ref={input}
              value={value}
              onChange={(event) => setValue(event.target.value.replace(/^[~´`^¨]+/, ''))}
              onKeyDown={onKeyDown}
              data-captures-tab={value.trim() ? 'true' : undefined}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="send"
              className="min-h-11 min-w-0 flex-1 bg-transparent text-[16px] text-text caret-gold -outline-offset-2 sm:text-[0.8125rem]"
            />
          </label>
        </div>
      </m.div>
    </div>
  );
}
