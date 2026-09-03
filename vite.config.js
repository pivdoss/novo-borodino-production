import path from 'node:path';
import { defineConfig } from 'vite';

const input = (file) => path.resolve(process.cwd(), file);

export default defineConfig({
  plugins: [{
    name: 'admin-directory-redirect',
    configureServer(server) {
      server.middlewares.use('/admin', (request, response, next) => {
        if (request.url === '/' || request.url === '') {
          response.writeHead(302, { Location: '/admin/index.html' });
          response.end();
          return;
        }
        next();
      });
    },
  }],
  server: {
    proxy: {
      '/api': {
        target: 'http://registry-api:8787',
        changeOrigin: true,
      },
    },
  },
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
