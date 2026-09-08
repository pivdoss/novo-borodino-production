import path from 'node:path';
import { spawnSync } from 'node:child_process';
process.env.NODE_ENV = 'production';
await import('./generate-pages.mjs');
const result = spawnSync(process.execPath, [path.resolve('node_modules/vite/bin/vite.js'), 'build'], { stdio:'inherit', env:process.env });
if (result.status !== 0) process.exit(result.status || 1);
await import('./prune-production-assets.mjs');
