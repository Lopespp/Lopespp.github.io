// Entrada do pré-render: usada só no build (scripts/prerender.mjs).
import { renderToString } from 'react-dom/server';
import { BASE, SITE_URL } from '../site.config';
import { App } from './App';
import { contents, DEFAULT_LANG } from './content';
import type { Lang } from './content/types';
import { Cv } from './cv/Cv';

export { BASE, SITE_URL, contents, DEFAULT_LANG };

export const renderApp = (lang: Lang = DEFAULT_LANG): string => renderToString(<App initialLang={lang} />);

export const renderCv = (lang: Lang = DEFAULT_LANG): string => renderToString(<Cv content={contents[lang]} />);
