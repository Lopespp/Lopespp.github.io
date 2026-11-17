import type { Content } from '../content/types';
import { Icon } from '../lib/icons';
import { useApp } from '../state/app';

type ChipId = Content['selector']['chips'][number]['id'];

/** Atalho do recrutador: chips que levam direto ao que ele quer saber. */
export function Selector() {
  const { t, goToTab, openOverlay } = useApp();

  const act = (id: ChipId) => {
    if (id === 'summary') openOverlay('summary');
    else if (id === 'projects') goToTab('gold', { scroll: true });
    else if (id === 'about') goToTab('bronze', { scroll: true });
    else goToTab('contato', { scroll: true });
  };

  return (
    <section aria-labelledby="selector-title" className="js-only container-page pb-10 md:pb-14">
      <h2 id="selector-title" className="label-mono text-muted">
        {t.selector.title}
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2.5">
        {t.selector.chips.map((chip) => (
          <li key={chip.id}>
            <button
              type="button"
              className="chip"
              aria-haspopup={chip.id === 'summary' ? 'dialog' : undefined}
              onClick={() => act(chip.id)}
            >
              <Icon name={chip.icon} size={17} className="flex-none text-gold-ink" />
              <span className="font-medium">{chip.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
