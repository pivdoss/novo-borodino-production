import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = process.env.PLOTS_DB_PATH || path.join(root, 'runtime', 'registry', 'registry.sqlite');
const seedPath = process.env.PLOTS_SEED_PATH || path.join(root, 'data', 'plots.json');
const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));

try {
  await fs.access(dbPath);
} catch {
  console.log('Registry sync check skipped: SQLite database is not available in this environment.');
  process.exit(0);
}

const db = new DatabaseSync(dbPath, { readOnly: true });
const live = db.prepare('SELECT id, area_sotka AS areaSotka, cadastral_ref AS cadastralRef, status, price_per_sotka AS pricePerSotka, land_use AS landUse FROM plots ORDER BY id').all();
db.close();

const source = new Map(seed.plots.map((plot) => [plot.id, plot]));
const errors = [];
if (live.length !== source.size) errors.push('Different plot count in JSON and SQLite.');
for (const plot of live) {
  const expected = source.get(plot.id);
  if (!expected) { errors.push('Plot #' + plot.id + ' exists only in SQLite.'); continue; }
  if (plot.areaSotka !== expected.areaSotka || plot.cadastralRef !== (expected.cadastralRef || null) || plot.status !== expected.status || plot.pricePerSotka !== seed.pricePerSotka || plot.landUse !== seed.landUse) errors.push('Plot #' + plot.id + ' differs between JSON and SQLite.');
}
for (const id of source.keys()) if (!live.some((plot) => plot.id === id)) errors.push('Plot #' + id + ' exists only in JSON.');
if (errors.length) {
  console.error('Registry sync check failed:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log('Registry sync check passed: ' + live.length + ' plots are identical.');
