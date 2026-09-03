import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFile(path.join(root, file), 'utf8');
const [main, landing, api, compose, nginx] = await Promise.all([
  read('src/main.js'), read('src/lot-landing.js'), read('server/registry-api.mjs'), read('docker-compose.yml'), read('nginx.conf'),
]);
const checks = [
  [landing.includes('земельный актив 6,2 га') && landing.includes('71 участок') && landing.includes('1 га внутренних дорог') && landing.includes('55 млн ₽'), 'landing contains the confirmed 6.2 ha asset'],
  [main.includes('initAnalyticsConsent'), 'analytics starts only through the consent module'],
  [landing.includes('contacts.whatsappUrl') && landing.includes('contacts.telegramUrl') && landing.includes('contacts.maxUrl'), 'landing exposes configured contact channels'],
  [!api.includes('YouGile') && !api.includes('/api/leads'), 'registry API has no CRM or lead endpoint'],
  [api.includes("/api/public/plots"), 'public registry endpoint exists'],
  [api.includes("admin-login', 5, 15"), 'admin login is rate limited'],
  [compose.includes('registry-api') && !compose.includes('lead-api'), 'compose uses registry API only'],
  [nginx.includes('registry-api:8787') && nginx.includes('mc.yandex.ru'), 'nginx routes API and allows Yandex Metrika after consent'],
];
const failed = checks.filter(([ok]) => !ok).map(([, label]) => label);
if (failed.length) { console.error(`Runtime contract check failed: ${failed.join('; ')}`); process.exit(1); }
console.log(`Runtime contact-only checks passed (${checks.length}).`);
