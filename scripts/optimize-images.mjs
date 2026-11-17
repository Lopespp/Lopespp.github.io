// Gera as versões otimizadas das imagens em public/.
// Rode `npm run images` depois de trocar assets/pietro.jpg, as badges em assets/badges/
// ou as imagens em public/handy-bird/.
import { mkdirSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'public/img');
mkdirSync(out, { recursive: true });

// Foto do hero: 160px no celular e 280px no desktop, com versões para telas 2x.
const photo = resolve(root, 'assets/pietro.jpg');
for (const size of [320, 560]) {
  const base = sharp(photo).resize(size, size, { fit: 'cover' });
  await base.clone().avif({ quality: 55 }).toFile(resolve(out, `pietro-${size}.avif`));
  await base.clone().webp({ quality: 78 }).toFile(resolve(out, `pietro-${size}.webp`));
  await base.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(resolve(out, `pietro-${size}.jpg`));
}

// Handy Bird: os originais (JPG/PNG) ficam como fallback.
const handy = resolve(root, 'public/handy-bird');
await sharp(resolve(handy, 'preview.jpg')).webp({ quality: 80 }).toFile(resolve(handy, 'preview.webp'));
await sharp(resolve(handy, 'preview.jpg')).resize(720).webp({ quality: 78 }).toFile(resolve(handy, 'preview-720.webp'));
await sharp(resolve(handy, 'handy.png')).webp({ lossless: true }).toFile(resolve(handy, 'handy.webp'));

// Badges de certificação: cada PNG de assets/badges vira .webp e .png em public/badges.
const badgesIn = resolve(root, 'assets/badges');
const badgesOut = resolve(root, 'public/badges');
mkdirSync(badgesOut, { recursive: true });
for (const file of readdirSync(badgesIn).filter((name) => name.endsWith('.png'))) {
  const name = file.replace(/\.png$/, '');
  const badge = sharp(resolve(badgesIn, file)).trim().resize(256, 256, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });
  await badge.clone().webp({ quality: 86 }).toFile(resolve(badgesOut, `${name}.webp`));
  await badge.clone().png({ compressionLevel: 9, palette: true }).toFile(resolve(badgesOut, `${name}.png`));
}

console.log('Imagens geradas em public/img, public/badges e public/handy-bird.');
