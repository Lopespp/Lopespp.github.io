// Gera, a partir do site já construído em dist/:
//   - o currículo em PDF (PT e EN), com o Chromium do Playwright
//   - a imagem de compartilhamento (og.jpg, 1200×630)
//   - o ícone apple-touch-icon.png
// Com `--save`, copia tudo também para public/, que serve de reserva quando o
// build roda numa máquina sem o navegador do Playwright.
import { copyFileSync, createReadStream, existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const save = process.argv.includes('--save');
const generated = [];

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.pdf': 'application/pdf',
  '.wasm': 'application/wasm',
};

/** Lê as configurações do site direto do HTML final, sem depender do TypeScript. */
function siteInfo() {
  const html = readFileSync(resolve(dist, 'index.html'), 'utf8');
  const ogUrl = html.match(/property="og:url" content="([^"]+)"/)?.[1] ?? 'http://localhost/';
  const base = new URL(ogUrl).pathname;
  const name = html.match(/"name":"([^"]+)"/)?.[1] ?? '';
  return { base, name, host: new URL(ogUrl).host + (base === '/' ? '' : base.replace(/\/$/, '')) };
}

function serve(base) {
  const server = createServer((request, response) => {
    let path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (!path.startsWith(base)) {
      response.writeHead(404).end();
      return;
    }
    path = normalize(path.slice(base.length));
    let file = join(dist, path);
    if (!file.startsWith(dist)) {
      response.writeHead(403).end();
      return;
    }
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!existsSync(file)) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(response);
  });
  return new Promise((done) => server.listen(0, '127.0.0.1', () => done(server)));
}

const dataUri = (file, type) => `data:${type};base64,${readFileSync(file).toString('base64')}`;
const font = (pkg, file) => dataUri(resolve(root, 'node_modules/@fontsource', pkg, 'files', file), 'font/woff2');

function output(name, buffer) {
  writeFileSync(resolve(dist, name), buffer);
  generated.push(name);
}

async function launch() {
  const { chromium } = await import('playwright');
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;
  return chromium.launch({ executablePath });
}

let browser;
try {
  browser = await launch();
} catch (error) {
  // No CI o PDF precisa ser gerado; localmente, vale a cópia que já está em public/.
  if (process.env.CI) throw error;
  console.warn(
    '\nAVISO: não consegui abrir o Chromium do Playwright, então o PDF do CV e a imagem og.jpg\n' +
      'não foram regerados (o build usa as cópias de public/). Para gerar: npx playwright install chromium\n',
  );
  process.exit(0);
}

const { base, name, host } = siteInfo();
const server = await serve(base);
const origin = `http://127.0.0.1:${server.address().port}`;

try {
  // 1. Currículo em PDF, um por idioma
  const cvs = [
    { lang: 'pt', file: 'cv-pietro-lopes.pdf' },
    { lang: 'en', file: 'cv-pietro-lopes-en.pdf' },
  ];
  for (const { lang, file } of cvs) {
    const page = await browser.newPage();
    await page.goto(`${origin}${base}cv.html?lang=${lang}&print=0`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ media: 'print' });
    const overflow = await page.evaluate(() => {
      const sheet = document.querySelector('.sheet');
      return sheet ? sheet.scrollHeight - sheet.clientHeight : 0;
    });
    if (overflow > 1) {
      console.warn(`AVISO: o currículo (${lang}) passou de uma página A4 em ${overflow}px. Enxugue o conteúdo.`);
    }
    output(file, await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true }));
    await page.close();
  }

  // 2. Imagem de compartilhamento, no visual do site
  const tagline =
    readFileSync(resolve(dist, 'cv.html'), 'utf8').match(/class="headline">([^<]+)</)?.[1] ?? '';
  const photo = dataUri(resolve(dist, 'img/pietro-560.jpg'), 'image/jpeg');
  const og = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await og.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    @font-face { font-family: SG; font-weight: 700; src: url(${font('space-grotesk', 'space-grotesk-latin-700-normal.woff2')}); }
    @font-face { font-family: JM; font-weight: 500; src: url(${font('jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff2')}); }
    * { box-sizing: border-box; margin: 0; }
    body { width: 1200px; height: 630px; background: #0B0D10; color: #E8EAED; overflow: hidden;
      background-image: radial-gradient(60% 70% at 78% 40%, rgba(240,185,74,.20), transparent 70%),
        linear-gradient(rgba(232,234,237,.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(232,234,237,.06) 1px, transparent 1px);
      background-size: 100% 100%, 48px 48px, 48px 48px; }
    main { display: flex; align-items: center; justify-content: space-between; height: 100%; padding: 0 84px; }
    .label { font: 500 22px JM; letter-spacing: .08em; text-transform: uppercase; color: #8A94A3; }
    h1 { margin-top: 18px; font: 700 104px/1 SG; letter-spacing: -.02em; }
    .tag { margin-top: 28px; font: 500 30px JM; color: #F0B94A; }
    .pipe { display: flex; align-items: center; margin-top: 54px; }
    .pipe i { width: 18px; height: 18px; border-radius: 50%; }
    .pipe b { width: 92px; height: 3px; }
    .ring { width: 372px; height: 372px; padding: 6px; border-radius: 50%; flex: none;
      background: conic-gradient(from 210deg, #C8875A, #B9C3CE, #F0B94A, #C8875A); }
    .ring img { width: 100%; height: 100%; border-radius: 50%; border: 8px solid #0B0D10; object-fit: cover; display: block; }
  </style></head><body><main>
    <div>
      <p class="label">// ${host}</p>
      <h1>${name}</h1>
      <p class="tag">${tagline}</p>
      <div class="pipe">
        <i style="background:#C8875A"></i><b style="background:linear-gradient(90deg,#C8875A,#B9C3CE)"></b>
        <i style="background:#B9C3CE"></i><b style="background:linear-gradient(90deg,#B9C3CE,#F0B94A)"></b>
        <i style="background:#F0B94A"></i>
      </div>
    </div>
    <div class="ring"><img src="${photo}" alt=""></div>
  </main></body></html>`);
  await og.evaluate(() => document.fonts.ready);
  output('og.jpg', await og.screenshot({ type: 'jpeg', quality: 88 }));
  await og.close();

  // 3. Ícone para a tela inicial do iOS, a partir do favicon
  const icon = await browser.newPage({ viewport: { width: 180, height: 180 }, deviceScaleFactor: 1 });
  const svg = readFileSync(resolve(dist, 'favicon.svg'), 'utf8').replace('rx="7"', 'rx="0"');
  await icon.setContent(
    `<style>*{margin:0}svg{display:block;width:180px;height:180px}</style>${svg}`,
  );
  output('apple-touch-icon.png', await icon.screenshot({ type: 'png' }));
  await icon.close();
} finally {
  await browser.close();
  server.close();
}

if (save) {
  for (const file of generated) copyFileSync(resolve(dist, file), resolve(root, 'public', file));
}
console.log(`Gerados em dist/${save ? ' e public/' : ''}: ${generated.join(', ')}`);
