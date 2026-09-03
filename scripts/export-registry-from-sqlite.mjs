import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const databasePath = process.env.PLOTS_DB_PATH || path.join(root, 'runtime', 'registry', 'registry.sqlite');
const seedPath = process.env.PLOTS_SEED_PATH || path.join(root, 'data', 'plots.json');
const write = process.argv.includes('--write');

await fs.access(databasePath).catch(() => {
  throw new Error(`SQLite-реестр не найден: ${databasePath}. Укажите PLOTS_DB_PATH.`);
});

const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
const db = new DatabaseSync(databasePath, { readOnly: true });
const plots = db.prepare('SELECT id, area_sotka AS areaSotka, cadastral_ref AS cadastralRef, status, price_per_sotka AS pricePerSotka, land_use AS landUse, updated_at AS updatedAt FROM plots ORDER BY id').all();
db.close();

if (!plots.length) throw new Error('SQLite-реестр не содержит участков.');
const pricePerSotka = plots[0].pricePerSotka;
const landUse = plots[0].landUse;
if (plots.some((plot) => plot.pricePerSotka !== pricePerSotka || plot.landUse !== landUse)) {
  throw new Error('В SQLite найдены разные общие цену за сотку или статус земли. Экспорт остановлен.');
}

const updatedAt = plots.reduce((latest, plot) => plot.updatedAt > latest ? plot.updatedAt : latest, plots[0].updatedAt);
const exported = {
  ...seed,
  pricePerSotka,
  landUse,
  updatedAt: updatedAt.slice(0, 10),
  plots: plots.map(({ updatedAt: _updatedAt, ...plot }) => plot),
};
const changed = JSON.stringify(seed) !== JSON.stringify(exported);

console.log(`SQLite: ${plots.length} участков, последняя дата изменения ${exported.updatedAt}.`);
console.log(changed ? 'Статический реестр отличается от SQLite.' : 'Статический реестр уже совпадает с SQLite.');

if (!write) {
  if (changed) console.log('Для записи подтверждённых данных используйте: pnpm run registry:export');
  process.exit(changed ? 1 : 0);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
await fs.copyFile(seedPath, `${seedPath}.${stamp}.bak`);
await fs.writeFile(seedPath, `${JSON.stringify(exported, null, 2)}\n`, 'utf8');
console.log(`Реестр обновлён из SQLite. Предыдущая версия сохранена: ${path.basename(seedPath)}.${stamp}.bak`);
