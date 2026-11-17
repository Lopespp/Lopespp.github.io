import { copyFileSync, createReadStream, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { BASE, SITE_URL } from './site.config.ts';

const root = dirname(fileURLToPath(import.meta.url));

/**
 * Os binários do MediaPipe (modo "navegar com a mão") são servidos do próprio site,
 * na mesma versão do pacote npm. Eles só são baixados quando o visitante ativa o modo.
 */
function mediapipeWasm(): Plugin {
  const source = resolve(root, 'node_modules/@mediapipe/tasks-vision/wasm');
  const files = ['vision_wasm_internal.js', 'vision_wasm_internal.wasm'];
  let outDir = 'dist';
  let ssr = false;
  return {
    name: 'mediapipe-wasm',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
      ssr = Boolean(config.build.ssr);
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const name = request.url?.split('?')[0].split('/mediapipe/')[1];
        if (!name || !files.includes(name)) return next();
        response.setHeader('Content-Type', name.endsWith('.wasm') ? 'application/wasm' : 'text/javascript');
        createReadStream(resolve(source, name)).pipe(response);
      });
    },
    closeBundle() {
      if (ssr || !existsSync(outDir)) return;
      mkdirSync(resolve(outDir, 'mediapipe'), { recursive: true });
      for (const file of files) copyFileSync(resolve(source, file), resolve(outDir, 'mediapipe', file));
    },
  };
}

/** Troca %SITE_URL% nos HTMLs de entrada (canonical, Open Graph). */
function siteUrl(): Plugin {
  return {
    name: 'site-url',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', SITE_URL + BASE.replace(/\/$/, '')),
  };
}

export default defineConfig({
  base: BASE,
  plugins: [react(), tailwindcss(), mediapipeWasm(), siteUrl()],
  build: {
    rolldownOptions: {
      input: {
        main: resolve(root, 'index.html'),
        cv: resolve(root, 'cv.html'),
      },
    },
  },
});
