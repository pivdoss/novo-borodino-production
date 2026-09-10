import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteUrl, publicRoutes, siteIndexable } from './site-config.mjs';
import { faq, asset } from '../src/data/asset.js';
import { landingMarkup } from '../src/lot-landing.js';
import { contacts, phoneHref } from '../src/data/contacts.js';
import { prepareLandingMarkup } from '../src/data/prepare-landing.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDirectory = path.join(projectRoot, 'public');

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
const absoluteUrl = (route) => `${siteUrl}${route}`;
const jsonLd = (value) => JSON.stringify(value).replaceAll('<', '\\u003c');

const documentMarkup = ({ title, description, route, body, robots = siteIndexable ? 'index,follow,max-image-preview:large' : 'noindex,follow', schemas = [] }) => `<!doctype html>
<html lang="ru"><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#13382c"><meta name="robots" content="${robots}"><meta name="author" content="Новое Бородино"><meta name="application-name" content="Новое Бородино">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="manifest" href="/site.webmanifest">
  <link rel="alternate" hreflang="ru" href="${absoluteUrl(route)}">
  ${route === '/' ? '<link rel="preload" as="image" href="/images/hero-novoe-borodino.webp" imagesrcset="/images/responsive/hero-800.webp 800w, /images/hero-novoe-borodino.webp 1536w" imagesizes="100vw" type="image/webp" fetchpriority="high">' : ''}
  <title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${absoluteUrl(route)}">
  <meta property="og:locale" content="ru_RU"><meta property="og:type" content="website"><meta property="og:site_name" content="Новое Бородино">
  <meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${absoluteUrl(route)}"><meta property="og:image" content="${absoluteUrl('/images/hero-novoe-borodino.webp')}"><meta property="og:image:alt" content="Территория земельного массива Новое Бородино"><meta property="og:image:type" content="image/webp">
  <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${absoluteUrl('/images/hero-novoe-borodino.webp')}">
  ${schemas.map((schema) => `<script type="application/ld+json">${jsonLd(schema)}</script>`).join('')}
</head><body><div id="app">${body}</div><script type="module" src="/src/main.js"></script></body></html>`;

const organization = {
  '@context': 'https://schema.org', '@type': 'Organization', name: 'Новое Бородино',
  url: absoluteUrl('/'), telephone: contacts.phone.replace(/[^+\d]/g, ''),
  address: { '@type': 'PostalAddress', addressCountry: 'RU', addressRegion: 'Московская область', addressLocality: 'деревня Новомихайловка' },
};
const siteTitle = 'Земельный массив 6,2 га за 55 млн ₽ — Новое Бородино, Можайск';
const siteDescription = 'Земельный актив 6,2 га в Можайском районе: 71 участок под застройку, 1 га внутренних дорог, схема, документы и реальные фотографии территории. Стоимость — 55 млн ₽.';
const listing = {
  '@context': 'https://schema.org', '@type': 'RealEstateListing', '@id': `${absoluteUrl('/')}#listing`, name: siteTitle,
  description: siteDescription, url: absoluteUrl('/'), image: absoluteUrl('/images/hero-novoe-borodino.webp'),
  about: { '@type': 'Place', name: 'Земельный массив «Новое Бородино»', address: organization.address, geo: { '@type': 'GeoCoordinates', latitude: 55.6026, longitude: 35.7208 } },
  areaServed: { '@type': 'AdministrativeArea', name: 'Можайский район, Московская область' },
  offers: { '@type': 'Offer', price: asset.price, priceCurrency: 'RUB', url: absoluteUrl('/'), description: 'Продажа земельного массива целиком: 5,2 га участков и 1 га внутренних дорог.' },
};

const cookieBody = `
  <a class="skip-link" href="#content">Перейти к содержимому</a>
  <header class="lot-header is-solid"><div class="lot-container lot-header__inner"><a class="lot-brand" href="/" aria-label="Новое Бородино — главная"><span>НБ</span><b>Новое<br>Бородино</b></a><a class="lot-header__phone" href="${phoneHref}">${contacts.phone}<small>ежедневно 09:00–20:00</small></a><a class="lot-button lot-button--dark lot-header__cta" href="/#contacts">Связаться</a></div></header>
<main id="content" class="cookie-page"><section class="lot-section"><div class="lot-container cookie-page__content"><p class="lot-kicker">Cookie и аналитика</p><h1>Настройки<br><em>аналитики.</em></h1><p>На сайте нет форм для имени, телефона или e-mail, и здесь не хранятся контактные заявки. Для связи с отделом продаж посетитель самостоятельно выбирает звонок или мессенджер. Если на опубликованной версии будет включена Яндекс Метрика, она начнёт работать только после вашего согласия.</p><h2>Что может использоваться</h2><p>Технические параметры посещения, обезличенные сведения о просмотре страниц и кликах, а также cookie аналитики Яндекс Метрики. Это помогает оценивать интерес к странице и улучшать её содержание.</p><h2>Ваш выбор</h2><p>Вы можете принять или отклонить аналитические cookie в появившейся плашке, а затем изменить решение внизу любой страницы.</p><a class="lot-button lot-button--dark" href="/">Вернуться к лендингу</a></div></section></main>
  <footer class="lot-footer"><div class="lot-container lot-footer__bottom"><span>© 2026 Новое Бородино</span><button type="button" data-cookie-settings>Настроить cookie</button></div></footer>`;

const notFound = `<!doctype html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex,follow"><title>Страница не найдена — Новое Бородино</title></head><body><main style="font-family:Arial,sans-serif;padding:48px"><h1>Страница не найдена</h1><p><a href="/">Вернуться на главную</a></p></main></body></html>`;

await fs.mkdir(path.join(projectRoot, 'cookie-i-analitika'), { recursive: true });
await fs.writeFile(path.join(projectRoot, 'index.html'), documentMarkup({
  title: siteTitle, description: siteDescription, route: '/', body: prepareLandingMarkup(landingMarkup()),
  schemas: [organization, listing, { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q,a]) => ({'@type':'Question', name:q, acceptedAnswer:{'@type':'Answer', text:a}})) }, { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Новое Бородино', url: absoluteUrl('/') }, { '@context': 'https://schema.org', '@type': 'WebPage', name: siteTitle, description: siteDescription, url: absoluteUrl('/'), image: absoluteUrl('/images/hero-novoe-borodino.webp'), mainEntity: { '@id': `${absoluteUrl('/')}#listing` } }],
}));
await fs.writeFile(path.join(projectRoot, 'cookie-i-analitika', 'index.html'), documentMarkup({
  title: 'Cookie и аналитика — Новое Бородино', description: 'Информация о настройках аналитических cookie на сайте «Новое Бородино».', route: '/cookie-i-analitika/', body: cookieBody,
  schemas: [organization, { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Cookie и аналитика — Новое Бородино', url: absoluteUrl('/cookie-i-analitika/') }],
}));
await fs.writeFile(path.join(projectRoot, '404.html'), notFound);
await fs.writeFile(path.join(publicDirectory, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${publicRoutes.map((route) => `\n  <url><loc>${absoluteUrl(route)}</loc></url>`).join('')}\n</urlset>\n`);
await fs.writeFile(path.join(publicDirectory, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`);
console.log('Generated landing page, cookie page and SEO files.');
