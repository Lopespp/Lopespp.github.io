import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/space-grotesk/latin-600.css';
import '@fontsource/space-grotesk/latin-700.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import './index.css';

import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import { DEFAULT_LANG } from './content';
import { storedLang } from './state/app';

const container = document.getElementById('root')!;
const lang = storedLang() ?? DEFAULT_LANG;
const prerendered = container.childElementCount > 0;

// O HTML pré-renderizado está no idioma padrão: nele o React só hidrata.
// Em outro idioma (ou no servidor de desenvolvimento), renderiza do zero.
if (prerendered && lang === DEFAULT_LANG) {
  hydrateRoot(
    container,
    <StrictMode>
      <App initialLang={lang} />
    </StrictMode>,
  );
} else {
  container.textContent = '';
  createRoot(container).render(
    <StrictMode>
      <App initialLang={lang} />
    </StrictMode>,
  );
}
