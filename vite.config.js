import path from 'node:path';
import { defineConfig } from 'vite';

const input = (file) => path.resolve(process.cwd(), file);

export default defineConfig({
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
