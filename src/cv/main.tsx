import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/space-grotesk/latin-600.css';
import '@fontsource/space-grotesk/latin-700.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import './cv.css';

import { createRoot } from 'react-dom/client';
import { contents, DEFAULT_LANG, isLang } from '../content';
import { readStored, STORAGE_KEYS } from '../lib/storage';
import { Cv } from './Cv';

const params = new URLSearchParams(window.location.search);
const requested = params.get('lang');
const saved = readStored(STORAGE_KEYS.lang);
const lang = isLang(requested) ? requested : isLang(saved) ? saved : DEFAULT_LANG;
const content = contents[lang];

document.documentElement.classList.add('js');
document.documentElement.lang = content.htmlLang;
document.title = content.cv.pageTitle;

const container = document.getElementById('root')!;
container.textContent = '';
createRoot(container).render(<Cv content={content} />);

document.addEventListener('click', (event) => {
  if (event.target instanceof Element && event.target.closest('[data-action="print"]')) window.print();
});

// O botão "Baixar CV" abre esta página, que já chama a impressão.
// `?print=0` mostra o currículo sem abrir o diálogo (usado também para gerar o PDF).
if (params.get('print') !== '0') {
  window.addEventListener('load', async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images, (image) => image.decode().catch(() => undefined)));
    window.print();
  });
}
