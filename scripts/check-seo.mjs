import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteUrl, publicRoutes, siteIndexable } from './site-config.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildRoot = path.join(projectRoot, 'dist');
const productionOrigin = siteUrl;
const localProductionPreview = process.env.ALLOW_LOCAL_PRODUCTION_PREVIEW === 'true';
const errors = [];

const routeFile = (route) => route === '/'
  ? path.join(buildRoot, 'index.html')
  : path.join(buildRoot, route.replace(/^\//, ''), 'index.html');

const capture = (html, expression) => expression.exec(html)?.[1]?.trim() || '';
const exists = async (filePath) => fs.access(filePath).then(() => true).catch(() => false);

const titles = new Map();
const descriptions = new Map();
const referencedPaths = new Set();

for (const route of publicRoutes) {
  const filePath = routeFile(route);
  if (!(await exists(filePath))) {
    errors.push(`${route}: отсутствует HTML-файл`);
    continue;
  }

  const html = await fs.readFile(filePath, 'utf8');
  const title = capture(html, /<title>([\s\S]*?)<\/title>/i);
  const description = capture(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
  const canonical = capture(html, /<link\s+rel="canonical"\s+href="([^"]+)"/i);
  const h1Count = (html.match(/<h1\b/gi) || []).length;

  if (!/<html\s+lang="ru"/i.test(html)) errors.push(`${route}: не указан lang="ru"`);
  if (!title) errors.push(`${route}: отсутствует title`);
  if (!description || description.length < 70) errors.push(`${route}: description отсутствует или слишком короткий`);
  if (canonical !== `${productionOrigin}${route}`) errors.push(`${route}: неверный canonical (${canonical})`);
  if (h1Count !== 1) errors.push(`${route}: найдено H1 — ${h1Count}`);
  if (siteIndexable && /name="robots"[^>]+noindex/i.test(html)) errors.push(`${route}: публичная страница закрыта от индексации`);
  if (html.includes('/@vite/client') || html.includes('/src/')) errors.push(`${route}: в production HTML осталась ссылка на исходный код Vite`);
  if (/готовые дома/i.test(html)) errors.push(`${route}: найдена неподтверждённая формулировка «готовые дома»`);
  if (/ИЖС/i.test(html)) errors.push(`${route}: найден устаревший термин «ИЖС»`);

  if (titles.has(title)) errors.push(`${route}: title дублирует ${titles.get(title)}`);
  if (descriptions.has(description)) errors.push(`${route}: description дублирует ${descriptions.get(description)}`);
  titles.set(title, route);
  descriptions.set(description, route);

  const jsonScripts = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  if (!jsonScripts.length) errors.push(`${route}: отсутствует JSON-LD`);
  for (const [, json] of jsonScripts) {
    try { JSON.parse(json); } catch { errors.push(`${route}: невалидный JSON-LD`); }
  }

  for (const [, rawReference] of html.matchAll(/(?:href|src)="([^"]+)"/gi)) {
    if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(rawReference)) continue;
    const cleanPath = rawReference.split(/[?#]/)[0];
    if (cleanPath) referencedPaths.add(cleanPath);
  }
}

for (const reference of referencedPaths) {
  const relative = reference.replace(/^\//, '');
  const target = reference.endsWith('/')
    ? path.join(buildRoot, relative, 'index.html')
    : path.join(buildRoot, relative);
  if (!(await exists(target))) errors.push(`Битая локальная ссылка или ресурс: ${reference}`);
}

const sitemapPath = path.join(buildRoot, 'sitemap.xml');
const sitemap = await fs.readFile(sitemapPath, 'utf8').catch(() => '');
const sitemapRoutes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
  const url = new URL(match[1]);
  const configured = new URL(productionOrigin + '/');
  if (url.origin !== configured.origin || !url.pathname.startsWith(configured.pathname)) errors.push('sitemap.xml contains another domain: ' + match[1]);
  const relative = '/' + url.pathname.slice(configured.pathname.length).replace(/^\/+/, '');
  return relative === '/' ? '/' : relative;
});
if (JSON.stringify(sitemapRoutes) !== JSON.stringify(publicRoutes)) errors.push('sitemap.xml не совпадает со списком публичных страниц');
if (sitemapRoutes.some((route) => /[#?]|admin\.html|\/api\//i.test(route)) || (!localProductionPreview && /localhost/i.test(sitemap))) {
  errors.push('sitemap.xml содержит служебный или неканонический адрес');
}

const robots = await fs.readFile(path.join(buildRoot, 'robots.txt'), 'utf8').catch(() => '');
if (!robots.includes('Sitemap: ' + productionOrigin + '/sitemap.xml')) errors.push('robots.txt does not contain the configured Sitemap URL');
if (await exists(path.join(buildRoot, 'admin.html'))) errors.push('Устаревшая admin.html ошибочно попала в сборку');
if (await exists(path.join(buildRoot, 'admin'))) errors.push('Админка ошибочно попала в production-сборку');
if (/\/(?:admin|api)\//i.test(sitemap)) errors.push('sitemap.xml содержит служебный адрес');

const notFound = await fs.readFile(path.join(buildRoot, '404.html'), 'utf8').catch(() => '');
if (!/noindex,follow/i.test(notFound) || !/<h1\b/i.test(notFound)) errors.push('страница 404 отсутствует или настроена неверно');

if (errors.length) {
  console.error(`SEO check failed (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`SEO check passed: ${publicRoutes.length} pages, ${referencedPaths.size} local links and resources.`);
