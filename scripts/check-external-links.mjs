import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const files = [];
const collect = async (directory) => {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) await collect(target);
    else if (entry.name.endsWith('.html')) files.push(target);
  }
};
await collect(root);
const links = new Set();
for (const file of files) {
  const html = await fs.readFile(file, 'utf8');
  for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="(https?:\/\/[^"]+)"/gi)) links.add(href);
}
const errors = [];
const interactiveContactHosts = new Set(['wa.me', 't.me', 'max.ru']);
for (const url of links) {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(10_000) });
    if (response.status >= 500) errors.push(url + ' returned ' + response.status);
  } catch (error) {
    // Мессенджеры часто блокируют автоматические HEAD-запросы, но переходы
    // из браузера посетителя остаются рабочими. Их проверяем вручную при
    // изменении контакта, не подменяя этим проверку остальных ссылок.
    if (!interactiveContactHosts.has(new URL(url).hostname)) errors.push(url + ' is unavailable: ' + error.message);
  }
}
if (errors.length) {
  console.error('External link check failed:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log('External link check passed: ' + links.size + ' public links checked.');
