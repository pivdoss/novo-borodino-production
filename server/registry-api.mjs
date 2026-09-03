import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { isIP } from 'node:net';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const port = Number(process.env.PORT || 8787);
const databasePath = process.env.REGISTRY_DB_PATH || '/app/data/registry.sqlite';
const plotsSeedPath = process.env.PLOTS_SEED_PATH || '/app/seed/plots.json';
const isProduction = process.env.NODE_ENV === 'production';
const configuredOrigins = String(process.env.SITE_ORIGIN || '').split(',').map((value) => value.trim()).filter(Boolean);
const adminSessionSecret = String(process.env.ADMIN_SESSION_SECRET || '').trim();
const adminAllowedIps = String(process.env.ADMIN_ALLOWED_IPS || '').split(',').map((value) => value.trim()).filter(Boolean);
const adminSessionHours = 24;

const unsafeProductionOrigin = (value) => {
  try {
    const url = new URL(value);
    return url.protocol !== 'https:' || /(^|\.)localhost$/i.test(url.hostname) || url.hostname === '127.0.0.1' || url.hostname === 'example.invalid' || url.origin !== value;
  } catch { return true; }
};
if (isProduction) {
  if (configuredOrigins.length !== 1 || unsafeProductionOrigin(configuredOrigins[0])) throw new Error('Production SITE_ORIGIN must be one real HTTPS origin.');
  if (!String(process.env.ADMIN_USERNAME || '').trim()) throw new Error('ADMIN_USERNAME is required in production.');
  if (String(process.env.ADMIN_PASSWORD || '').length <= 16) throw new Error('ADMIN_PASSWORD must be longer than 16 characters in production.');
  if (!/^[A-Za-z0-9_-]{43,}$/.test(adminSessionSecret)) throw new Error('ADMIN_SESSION_SECRET must be a random base64url value of at least 32 bytes.');
  if (!adminAllowedIps.length || adminAllowedIps.some((value) => !isIP(value))) throw new Error('ADMIN_ALLOWED_IPS must contain one or more exact IP addresses in production.');
}

await fs.mkdir(path.dirname(databasePath), { recursive: true });
const db = new DatabaseSync(databasePath);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;
  CREATE TABLE IF NOT EXISTS rate_limits (ip_hash TEXT PRIMARY KEY, window_started_at TEXT NOT NULL, request_count INTEGER NOT NULL, updated_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS plots (id INTEGER PRIMARY KEY, area_sotka REAL NOT NULL, cadastral_ref TEXT, status TEXT NOT NULL CHECK(status IN ('available', 'reserved', 'sold')), price_per_sotka INTEGER NOT NULL, land_use TEXT NOT NULL, updated_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS admin_sessions (token_hash TEXT PRIMARY KEY, expires_at TEXT NOT NULL, created_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS admin_audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, actor TEXT NOT NULL, action TEXT NOT NULL, target_type TEXT NOT NULL, target_id TEXT NOT NULL, details_json TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL);
  CREATE INDEX IF NOT EXISTS admin_audit_log_created_at ON admin_audit_log(created_at DESC);
`);
if (db.prepare('SELECT COUNT(*) AS count FROM plots').get().count === 0) {
  const seed = JSON.parse(await fs.readFile(plotsSeedPath, 'utf8'));
  const insert = db.prepare('INSERT INTO plots (id, area_sotka, cadastral_ref, status, price_per_sotka, land_use, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const plot of seed.plots) insert.run(plot.id, plot.areaSotka, plot.cadastralRef || null, plot.status, seed.pricePerSotka, seed.landUse, seed.updatedAt);
}

const nowIso = () => new Date().toISOString();
const text = (value, maxLength) => typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
const requestIp = (request) => text(String(request.headers['x-real-ip'] || request.socket.remoteAddress || ''), 80);
const ipHash = (request) => crypto.createHash('sha256').update(requestIp(request)).digest('hex');
const allowedAdminIp = (request) => !adminAllowedIps.length || adminAllowedIps.includes(requestIp(request));
const cookieValue = (request, name) => String(request.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) || '';
const tokenHash = (token) => crypto.createHmac('sha256', adminSessionSecret).update(token).digest('hex');
const hasAdminCredentials = () => Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD && adminSessionSecret);
const sameSecret = (actual, expected) => {
  const left = Buffer.from(actual || ''); const right = Buffer.from(expected || '');
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};
const isAdmin = (request) => {
  const token = cookieValue(request, 'nb_admin_session');
  return Boolean(token && db.prepare('SELECT 1 FROM admin_sessions WHERE token_hash = ? AND expires_at > ?').get(tokenHash(token), nowIso()));
};
const secureCookie = () => configuredOrigins.some((origin) => origin.startsWith('https://')) ? '; Secure' : '';
const sessionCookie = (token) => `nb_admin_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${adminSessionHours * 3600}${secureCookie()}`;
const expiredCookie = () => `nb_admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secureCookie()}`;
const publicRegistry = () => {
  const plots = db.prepare('SELECT id, area_sotka AS areaSotka, cadastral_ref AS cadastralRef, status FROM plots ORDER BY id').all();
  const config = db.prepare('SELECT price_per_sotka AS pricePerSotka, land_use AS landUse, (SELECT MAX(updated_at) FROM plots) AS updatedAt FROM plots ORDER BY id LIMIT 1').get();
  return { ...config, plots };
};
const writeAudit = (actor, action, targetType, targetId, details = {}) => db.prepare('INSERT INTO admin_audit_log (actor, action, target_type, target_id, details_json, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(actor, action, targetType, String(targetId), JSON.stringify(details), nowIso());
const sendJson = (response, status, payload, retryAfterSeconds = 0) => {
  const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
  if (retryAfterSeconds) headers['Retry-After'] = String(retryAfterSeconds);
  response.writeHead(status, headers); response.end(JSON.stringify(payload));
};
const readJson = (request) => new Promise((resolve, reject) => {
  let raw = '';
  request.on('data', (chunk) => { raw += chunk; if (raw.length > 32_000) request.destroy(new Error('Request body too large')); });
  request.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { reject(new Error('Invalid JSON')); } });
  request.on('error', reject);
});
const rateLimit = (request, scope, limit, minutes) => {
  const key = `${scope}:${ipHash(request)}`; const current = db.prepare('SELECT window_started_at, request_count FROM rate_limits WHERE ip_hash = ?').get(key);
  const now = Date.now(); const windowMs = minutes * 60_000; const active = current && now - Date.parse(current.window_started_at) < windowMs; const count = active ? current.request_count : 0;
  if (count >= limit) return { allowed: false, retryAfter: Math.max(1, Math.ceil((Date.parse(current.window_started_at) + windowMs - now) / 1000)) };
  db.prepare('INSERT INTO rate_limits (ip_hash, window_started_at, request_count, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(ip_hash) DO UPDATE SET window_started_at=excluded.window_started_at, request_count=excluded.request_count, updated_at=excluded.updated_at').run(key, active ? current.window_started_at : nowIso(), count + 1, nowIso());
  return { allowed: true, key };
};
const mutationError = (request) => {
  const origin = String(request.headers.origin || '').trim();
  const contentType = String(request.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
  if (!origin || (configuredOrigins.length ? !configuredOrigins.includes(origin) : !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin))) return 'Источник запроса не разрешён.';
  if (String(request.headers['sec-fetch-site'] || '').toLowerCase() !== 'same-origin') return 'Запрос должен быть выполнен со страницы этого сайта.';
  if (contentType !== 'application/json') return 'Требуется Content-Type: application/json.';
  return '';
};

const handler = async (request, response) => {
  if ((request.url === '/health' || request.url === '/api/health') && request.method === 'GET') return sendJson(response, 200, { ok: true });
  if (request.url === '/api/public/plots' && request.method === 'GET') return sendJson(response, 200, publicRegistry());
  if (['POST', 'PUT', 'DELETE'].includes(request.method)) { const error = mutationError(request); if (error) return sendJson(response, error.startsWith('Требуется') ? 415 : 403, { error }); }

  if (request.url === '/api/admin/login' && request.method === 'POST') {
    if (!hasAdminCredentials()) return sendJson(response, 503, { error: 'Доступ администратора ещё не настроен.' });
    if (!allowedAdminIp(request)) return sendJson(response, 403, { error: 'Доступ к админке разрешён только с доверенного IP-адреса.' });
    const limit = rateLimit(request, 'admin-login', 5, 15);
    if (!limit.allowed) return sendJson(response, 429, { error: 'Слишком много попыток входа. Повторите позднее.' }, limit.retryAfter);
    const body = await readJson(request).catch(() => ({}));
    if (!sameSecret(text(body.username, 120), process.env.ADMIN_USERNAME) || !sameSecret(text(body.password, 300), process.env.ADMIN_PASSWORD)) { writeAudit('anonymous', 'admin_login_failed', 'admin', 'login', { ipHash: ipHash(request) }); return sendJson(response, 401, { error: 'Неверный логин или пароль.' }); }
    db.prepare('DELETE FROM rate_limits WHERE ip_hash = ?').run(limit.key);
    db.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?').run(nowIso());
    const token = crypto.randomBytes(32).toString('base64url'); const expiresAt = new Date(Date.now() + adminSessionHours * 3600_000).toISOString();
    db.prepare('INSERT INTO admin_sessions (token_hash, expires_at, created_at) VALUES (?, ?, ?)').run(tokenHash(token), expiresAt, nowIso());
    writeAudit(process.env.ADMIN_USERNAME, 'admin_login', 'admin', process.env.ADMIN_USERNAME);
    response.setHeader('Set-Cookie', sessionCookie(token)); return sendJson(response, 200, { ok: true, expiresAt });
  }
  if (request.url === '/api/admin/logout' && request.method === 'POST') { const token = cookieValue(request, 'nb_admin_session'); if (token && hasAdminCredentials()) { db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').run(tokenHash(token)); writeAudit(process.env.ADMIN_USERNAME, 'admin_logout', 'admin', process.env.ADMIN_USERNAME); } response.setHeader('Set-Cookie', expiredCookie()); return sendJson(response, 200, { ok: true }); }
  if (!request.url.startsWith('/api/admin/')) return sendJson(response, 404, { error: 'Не найдено.' });
  if (!hasAdminCredentials()) return sendJson(response, 503, { error: 'Доступ администратора ещё не настроен.' });
  if (!allowedAdminIp(request)) return sendJson(response, 403, { error: 'Доступ к админке разрешён только с доверенного IP-адреса.' });
  if (!isAdmin(request)) return sendJson(response, 401, { error: 'Требуется вход в админку.' });
  if (request.url === '/api/admin/plots' && request.method === 'GET') return sendJson(response, 200, publicRegistry());
  if (request.url === '/api/admin/audit-log' && request.method === 'GET') return sendJson(response, 200, { entries: db.prepare('SELECT actor, action, target_type AS targetType, target_id AS targetId, details_json AS detailsJson, created_at AS createdAt FROM admin_audit_log ORDER BY created_at DESC LIMIT 200').all() });
  if (request.url === '/api/admin/sessions/revoke-all' && request.method === 'POST') { const result = db.prepare('DELETE FROM admin_sessions').run(); writeAudit(process.env.ADMIN_USERNAME, 'admin_sessions_revoked_all', 'admin', process.env.ADMIN_USERNAME, { revokedCount: result.changes }); response.setHeader('Set-Cookie', expiredCookie()); return sendJson(response, 200, { ok: true, revokedCount: result.changes }); }
  const plotMatch = request.url.match(/^\/api\/admin\/plots\/(\d+)$/);
  if (plotMatch && request.method === 'PUT') {
    const id = Number(plotMatch[1]); const body = await readJson(request).catch(() => ({}));
    if (!['available', 'reserved', 'sold'].includes(body.status)) return sendJson(response, 400, { error: 'Укажите корректный статус участка.' });
    const plot = db.prepare('SELECT status FROM plots WHERE id = ?').get(id);
    if (!plot) return sendJson(response, 404, { error: 'Участок не найден.' });
    if (plot.status !== body.status) { const updatedAt = nowIso().slice(0, 10); db.prepare('UPDATE plots SET status = ?, updated_at = ? WHERE id = ?').run(body.status, updatedAt, id); db.prepare('UPDATE plots SET updated_at = ?').run(updatedAt); writeAudit(process.env.ADMIN_USERNAME, 'plot_status_changed', 'plot', id, { previousStatus: plot.status, nextStatus: body.status }); }
    return sendJson(response, 200, publicRegistry());
  }
  return sendJson(response, 404, { error: 'Не найдено.' });
};

const server = http.createServer((request, response) => handler(request, response).catch((error) => { console.error(error); if (!response.headersSent) sendJson(response, 500, { error: 'Внутренняя ошибка сервера.' }); }));
server.headersTimeout = 15_000; server.requestTimeout = 20_000; server.keepAliveTimeout = 5_000;
server.listen(port, '0.0.0.0', () => console.log(`Registry API listens on ${port}`));
