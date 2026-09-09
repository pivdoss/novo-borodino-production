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
      output: {
        // GitHub Pages may keep an HTML document in a browser cache while a
        // new deployment replaces hashed assets. A stable stylesheet path
        // prevents the page from rendering without its design across updates.
        assetFileNames: (asset) => asset.name?.endsWith('.css')
          ? 'assets/main.css'
          : 'assets/[name]-[hash][extname]',
      },
      input: {
        home: input('index.html'),
        cookieAnalytics: input('cookie-i-analitika/index.html'),
        notFound: input('404.html'),
      },
    },
  },
});
