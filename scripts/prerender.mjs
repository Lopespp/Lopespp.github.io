// Depois do build: coloca o HTML pronto dentro de dist/index.html e dist/cv.html
// (o site funciona sem JavaScript e os buscadores leem o conteúdo), preenche as
// tags de SEO a partir do conteúdo, aplica a Content Security Policy e gera
// sitemap.xml e robots.txt.
import { createHash } from 'node:crypto';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const ssr = resolve(root, '.ssr');

const { renderApp, renderCv, contents, DEFAULT_LANG, BASE, SITE_URL } = await import(
  pathToFileURL(resolve(ssr, 'entry-server.js')).href
);

const content = contents[DEFAULT_LANG];
const site = SITE_URL + BASE.replace(/\/$/, '');
const escape = (text) =>
  text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const person = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: content.profile.name,
  url: `${site}/`,
  image: `${site}/og.jpg`,
  jobTitle: content.meta.jobTitle,
  worksFor: { '@type': 'Organization', name: content.profile.employer },
  alumniOf: { '@type': 'CollegeOrUniversity', name: content.profile.university },
  knowsLanguage: ['pt-BR', 'en'],
  hasCredential: {
    '@type': 'EducationalOccupationalCredential',
    name: content.silver.certification.title,
    credentialCategory: 'certification',
  },
  sameAs: [content.profile.linkedin, content.profile.github],
};

const seo = (title, description, extra = '') =>
  [
    `<title>${escape(title)}</title>`,
    `<meta name="description" content="${escape(description)}" />`,
    `<meta property="og:title" content="${escape(title)}" />`,
    `<meta property="og:description" content="${escape(description)}" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    `<meta property="og:locale:alternate" content="en_US" />`,
    `<meta name="twitter:title" content="${escape(title)}" />`,
    `<meta name="twitter:description" content="${escape(description)}" />`,
    extra,
  ]
    .filter(Boolean)
    .join('\n    ');

/**
 * Content Security Policy. O GitHub Pages não permite configurar cabeçalhos, então
 * a política vai numa tag <meta>. Tudo vem do próprio site: nada de scripts, fontes
 * ou requisições de terceiros. Os scripts embutidos no HTML são liberados um a um,
 * pelo hash do conteúdo.
 */
function contentSecurityPolicy(html) {
  const hashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
    ([, code]) => `'sha256-${createHash('sha256').update(code).digest('base64')}'`,
  );
  const policy = [
    "default-src 'self'",
    // 'wasm-unsafe-eval' é exigido pelo WebAssembly do modo "navegar com a mão".
    ["script-src 'self' 'wasm-unsafe-eval'", ...hashes].join(' '),
    // As animações aplicam estilos direto nos elementos.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self'",
    "font-src 'self'",
    "connect-src 'self'",
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "frame-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
  ].join('; ');
  return `<meta http-equiv="Content-Security-Policy" content="${policy}" />`;
}

function fillPage(file, html, head) {
  const path = resolve(dist, file);
  const template = readFileSync(path, 'utf8');
  for (const marker of ['<!--app-->', '<!--seo-->', '<!--csp-->']) {
    if (!template.includes(marker)) throw new Error(`${file}: marcador ${marker} não encontrado`);
  }
  const page = template.replace('<!--app-->', () => html).replace('<!--seo-->', () => head);
  writeFileSync(path, page.replace('<!--csp-->', () => contentSecurityPolicy(page)));
}

fillPage(
  'index.html',
  renderApp(DEFAULT_LANG),
  seo(
    content.meta.title,
    content.meta.description,
    `<script type="application/ld+json">${JSON.stringify(person).replace(/</g, '\\u003c')}</script>`,
  ),
);
fillPage('cv.html', renderCv(DEFAULT_LANG), seo(content.cv.pageTitle, content.cv.summary));

const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  resolve(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${site}/</loc><lastmod>${today}</lastmod></url>
  <url><loc>${site}/cv.html</loc><lastmod>${today}</lastmod></url>
</urlset>
`,
);
writeFileSync(resolve(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);

rmSync(ssr, { recursive: true, force: true });
console.log('Pré-render concluído: index.html, cv.html, sitemap.xml, robots.txt');
