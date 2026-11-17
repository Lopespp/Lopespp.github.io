import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useIsoLayoutEffect } from '../lib/hooks';
import { useApp } from '../state/app';
import { Tilt } from './Tilt';

const RAW = '#@%01xX_$&?!<>/\\{}[]=+*';
const DECODE_MS = 900;
const LOGS_MS = 1000;
const base = import.meta.env.BASE_URL;

/** Mesmo comprimento do nome, com o espaço no lugar: é o "dado bruto" inicial. */
const seedFor = (name: string) =>
  Array.from(name, (char, index) => (char === ' ' ? ' ' : RAW[(index * 7 + 3) % RAW.length])).join('');

interface Glyph {
  char: string;
  done: boolean;
}

function DecodedName({ name }: { name: string }) {
  const [glyphs, setGlyphs] = useState<Glyph[] | null>(null);

  useIsoLayoutEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains('intro')) return;
    const letters = Array.from(name);
    const perLetter = DECODE_MS / letters.length;
    const start = performance.now();
    let frame = 0;
    let lastShuffle = 0;
    let lastDecoded = -1;

    const tick = (now: number) => {
      const decoded = Math.floor((now - start) / perLetter);
      if (decoded >= letters.length) {
        setGlyphs(null);
        root.classList.remove('intro');
        return;
      }
      // Os caracteres ainda brutos trocam a cada ~45ms, não a cada quadro.
      if (decoded !== lastDecoded || now - lastShuffle > 45) {
        lastDecoded = decoded;
        lastShuffle = now;
        setGlyphs(
          letters.map((char, index) => {
            if (index < decoded || char === ' ') return { char, done: true };
            return { char: RAW[Math.floor(Math.random() * RAW.length)], done: false };
          }),
        );
      }
      frame = requestAnimationFrame(tick);
    };
    setGlyphs(letters.map((char, index) => ({ char: char === ' ' ? ' ' : seedFor(name)[index], done: false })));
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      root.classList.remove('intro');
    };
  }, [name]);

  return (
    <h1 id="hero-title" aria-label={name} className="hero-name text-display">
      <span aria-hidden="true" className="name-final">
        {name}
      </span>
      <span aria-hidden="true" className="name-scramble" data-seed={seedFor(name)}>
        {glyphs?.map((glyph, index) => (
          <span key={index} className={glyph.done ? 'done' : undefined}>
            {glyph.char}
          </span>
        ))}
      </span>
    </h1>
  );
}

/** Linhas de log do pipeline que passam atrás do nome durante a entrada. */
function IntroLogs({ lines }: { lines: string[] }) {
  const [visible, setVisible] = useState(false);

  useIsoLayoutEffect(() => {
    if (!document.documentElement.classList.contains('intro')) return;
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), LOGS_MS + 300);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 flex flex-col justify-center gap-0.5 font-mono text-xs text-muted opacity-40"
    >
      {lines.map((line, index) => (
        <span key={line} className="hero-log whitespace-nowrap" style={{ animationDelay: `${index * 90}ms` }}>
          {line}
        </span>
      ))}
    </div>
  );
}

function Photo({ alt }: { alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [node, setNode] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (node?.complete) setLoaded(true);
  }, [node]);

  const sizes = '(min-width: 1025px) 280px, (min-width: 768px) 220px, 160px';
  const srcSet = (extension: string) =>
    `${base}img/pietro-320.${extension} 320w, ${base}img/pietro-560.${extension} 560w`;

  return (
    <Tilt max={6} className="relative size-40 flex-none md:size-[220px] lg:size-[280px]">
      <span className="photo-ring" aria-hidden="true" />
      <span
        className={`absolute inset-[3px] overflow-hidden rounded-full bg-surface-2 ring-4 ring-bg ${
          loaded ? '' : 'skeleton'
        }`}
      >
        <picture>
          <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
          <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
          <img
            ref={setNode}
            src={`${base}img/pietro-560.jpg`}
            srcSet={srcSet('jpg')}
            sizes={sizes}
            width={560}
            height={560}
            alt={alt}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onLoad={() => setLoaded(true)}
            className="size-full object-cover"
          />
        </picture>
      </span>
    </Tilt>
  );
}

export function Hero() {
  const { t, goToTab } = useApp();

  const go = (tab: 'gold' | 'contato') => (event: React.MouseEvent) => {
    event.preventDefault();
    goToTab(tab, { scroll: true });
  };

  return (
    <section
      aria-labelledby="hero-title"
      className="container-page flex flex-col gap-8 pt-28 pb-10 md:flex-row-reverse md:items-center md:justify-between md:gap-10 md:pt-36 md:pb-16"
    >
      <Photo alt={t.hero.photoAlt} />

      <div className="relative min-w-0 max-w-[40rem]">
        <p className="label-mono text-muted">{t.hero.label}</p>
        <div className="relative isolate mt-3">
          <IntroLogs lines={t.hero.logs} />
          <DecodedName name={t.profile.name} />
        </div>
        <p className="mt-5 text-lg leading-snug font-medium text-text md:text-xl">{t.hero.subtitle}</p>
        <p className="mt-3 text-muted">{t.hero.personal}</p>

        <div className="mt-7 flex flex-wrap gap-3">
          <a href="#gold" onClick={go('gold')} className="btn btn-primary">
            {t.hero.ctaProjects}
            <ArrowRight size={18} aria-hidden="true" className="nudge-x" />
          </a>
          <a href="#contato" onClick={go('contato')} className="btn btn-secondary">
            {t.hero.ctaContact}
          </a>
        </div>
      </div>
    </section>
  );
}
