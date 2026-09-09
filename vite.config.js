import path from 'node:path';
import { defineConfig } from 'vite';

const input = (file) => path.resolve(process.cwd(), file);

export default defineConfig({
  // GitHub Pages serves this project from a repository subpath. Local and
  // standalone builds retain the root path by default.
  base: process.env.SITE_BASE || '/',
  server: { watch: { ignored: ['**/.audit_tmp/**'] } },
  build: {
    rollupOptions: {
      input: {
        home: input('index.html'),
        cookieAnalytics: input('cookie-i-analitika/index.html'),
        notFound: input('404.html'),
      },
    },
  },
});
