import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDirectory = path.join(projectRoot, 'dist', 'images');

// These remain in public/images as editable source files or historical assets,
// but the public site uses their WebP replacement (or does not reference them).
// Removing them from dist prevents unnecessary files from reaching the web server.
const excludedFromProduction = [
  'availability-plan.png',
  'render-street.png',
  'home-92.png',
  'home-117.png',
  'entry-road.jpg',
  'site-road.jpg',
  'hero-aerial.png',
  'hero-aerial.webp',
  'hero-aerial-640.webp',
  'availability-plan.webp',
  'reservoir.png',
  'reservoir.webp',
  'hero-novoe-borodino.png',
  'concept-scheme.png',
  'location-map-yandex.png',
];

await Promise.all(excludedFromProduction.map(async (fileName) => {
  await fs.rm(path.join(distDirectory, fileName), { force: true });
}));

// В новой версии продаётся только актив 6,2 га. Материалы других лотов,
// домов и старого каталога остаются в Git-архиве, но не попадают на сервер.
const excludedOfferAssets = [
  'cadastral-numbers.png', 'cadastral-numbers-v2.png', 'masterplan.png', 'plots-areas-numbers.png', 'plots-choice.png', 'plots-choice-hit-map.png',
  'invest-130-scheme.png', 'invest-130-view-1.jpg', 'invest-130-view-1.webp', 'invest-130-view-2.jpg', 'invest-130-view-2.webp',
  'invest-194-scheme.png', 'invest-194-view-1.jpg', 'invest-194-view-1.webp', 'invest-194-view-2.jpg', 'invest-194-view-2.webp',
  ...['75', '116'].flatMap((area) => [1, 2, 3, 4, 5].flatMap((number) => [`house-${area}-${number}.jpg`, `house-${area}-${number}.png`, `house-${area}-${number}.webp`])),
];
await Promise.all(excludedOfferAssets.map(async (fileName) => {
  await fs.rm(path.join(distDirectory, 'offers', fileName), { force: true });
}));

const excludedLegacyGallery = [
  ...['01', '02', '03', '04', '06', '07', '08', '09', '10'].map((number) => `actual-${number}.jpg`),
  ...['01', '02', '03', '04', '05', '06'].map((number) => `territory-slide-${number}.png`),
];
await Promise.all([
  ...excludedLegacyGallery.filter((name) => name.startsWith('actual-')).map((name) => fs.rm(path.join(distDirectory, 'actual-gallery', name), { force: true })),
  ...excludedLegacyGallery.filter((name) => name.startsWith('territory-')).map((name) => fs.rm(path.join(distDirectory, 'territory', name), { force: true })),
]);

// Vite copies public assets verbatim, including files used only by archived
// layouts. Keep only image paths that the compiled public pages actually
// reference; this prevents stale source media from reaching the web server.
const referencedImages = new Set();
const walk = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (/\.(?:html|css|js|json)$/i.test(entry.name)) {
      const text = await fs.readFile(file, 'utf8');
      for (const match of text.matchAll(/(?:https?:\/\/[^\s"']+)?(\/images\/[A-Za-z0-9_./-]+)/g)) referencedImages.add(match[1]);
    }
  }
};
await walk(path.join(projectRoot, 'dist'));
const imageRoot = path.join(projectRoot, 'dist', 'images');
await walk(imageRoot);
const imageFiles = [];
const collectImages = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await collectImages(file);
    else if (/\.(?:png|jpe?g|webp|avif|gif|svg)$/i.test(entry.name)) imageFiles.push(file);
  }
};
await collectImages(imageRoot);
await Promise.all(imageFiles.map(async (file) => {
  const relative = '/' + path.relative(path.join(projectRoot, 'dist'), file).replaceAll('\\', '/');
  if (!referencedImages.has(relative)) await fs.rm(file, { force: true });
}));

console.log('Pruned unused source image files from production output.');
