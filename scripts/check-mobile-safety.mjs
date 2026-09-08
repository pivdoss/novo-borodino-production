import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = await fs.readFile(path.join(root, 'dist', 'index.html'), 'utf8');
const mainCss = await fs.readFile(path.join(root, 'src', 'styles', 'main.css'), 'utf8');
const landingCss = await fs.readFile(path.join(root, 'src', 'styles', 'lot-landing.css'), 'utf8');
const source = html + mainCss + landingCss;
const required = [
  [/<meta name="viewport" content="width=device-width, initial-scale=1\.0"/, 'viewport meta tag'],
  [/body\s*\{[^}]*overflow-x:\s*clip/, 'horizontal overflow protection'],
  [/@media\s*\(max-width:\s*760px\)/, 'mobile breakpoint'],
  [/\.lot-hero h1\s*\{[^}]*font-size:\s*clamp/, 'responsive hero heading'],
  [/\.asset-metrics\s*\{[^}]*grid-template-columns:\s*1fr 1fr/, 'responsive facts grid'],
];
const errors = required.filter(([pattern]) => !pattern.test(source)).map(([, name]) => name);
if (errors.length) {
  console.error('Mobile safety check failed: ' + errors.join(', '));
  process.exit(1);
}
console.log('Mobile safety check passed.');
