const $ = (selector) => document.querySelector(selector);
const loginPanel = $('[data-login-panel]');
const app = $('[data-admin-app]');
const loginForm = $('[data-login-form]');
const loginMessage = $('[data-login-message]');
const plotMessage = $('[data-plot-message]');
const auditMessage = $('[data-audit-message]');
const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });
const money = new Intl.NumberFormat('ru-RU');
const date = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
let registry = null;
let auditEntries = [];

const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character]));
const api = async (url, options = {}) => {
  const response = await fetch(url, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Не удалось выполнить действие.');
  return data;
};
const setMessage = (element, message, state = '') => { element.textContent = message; element.dataset.state = state; };
const statusLabel = (status) => ({ available: 'Свободен', reserved: 'Забронирован', sold: 'Продан' }[status] || status);
const statusClass = (status) => status === 'sold' ? 'status--sold' : status === 'reserved' ? 'status--retry' : '';
const auditActionLabel = (action) => ({ admin_login: 'Вход в админку', admin_login_failed: 'Неудачный вход', admin_logout: 'Выход из админки', admin_sessions_revoked_all: 'Завершены все сессии', plot_status_changed: 'Изменён статус участка' }[action] || action);

const renderPlotSummary = () => {
  const sold = registry.plots.filter((plot) => plot.status === 'sold').length;
  const reserved = registry.plots.filter((plot) => plot.status === 'reserved').length;
  $('[data-plot-summary]').innerHTML = [['Всего', registry.plots.length], ['Свободно', registry.plots.length - sold - reserved], ['Забронировано', reserved], ['Продано', sold]].map(([label, value]) => `<article><span>${label}</span><strong>${value}</strong></article>`).join('');
};
const renderPlots = () => {
  const query = $('[data-plot-search]').value.trim();
  const filter = $('[data-plot-filter]').value;
  const rows = registry.plots.filter((plot) => (!query || String(plot.id).includes(query)) && (filter === 'all' || plot.status === filter));
  $('[data-plots-table]').innerHTML = rows.map((plot) => `<tr class="${plot.status === 'sold' ? 'is-sold' : ''}"><th>№${plot.id}</th><td>${number.format(plot.areaSotka)} соток</td><td>${money.format(Math.round(plot.areaSotka * registry.pricePerSotka))} ₽</td><td><span class="status ${statusClass(plot.status)}">${statusLabel(plot.status)}</span></td><td><select data-plot-status="${plot.id}" aria-label="Статус участка №${plot.id}"><option value="available" ${plot.status === 'available' ? 'selected' : ''}>Свободен</option><option value="reserved" ${plot.status === 'reserved' ? 'selected' : ''}>Забронирован</option><option value="sold" ${plot.status === 'sold' ? 'selected' : ''}>Продан</option></select> <button type="button" class="action-button" data-plot-id="${plot.id}">Сохранить</button></td></tr>`).join('') || '<tr><td colspan="5">Участки не найдены.</td></tr>';
};
const renderAudit = () => {
  $('[data-audit-table]').innerHTML = auditEntries.map((entry) => {
    let details = {};
    try { details = JSON.parse(entry.detailsJson || '{}'); } catch { details = {}; }
    const detailText = details.previousStatus ? `${statusLabel(details.previousStatus)} → ${statusLabel(details.nextStatus)}` : '';
    return `<tr><td>${date.format(new Date(entry.createdAt))}</td><td>${escapeHtml(entry.actor)}</td><td>${escapeHtml(auditActionLabel(entry.action))}</td><td>${escapeHtml(entry.targetType)} ${escapeHtml(entry.targetId)}</td><td>${escapeHtml(detailText)}</td></tr>`;
  }).join('') || '<tr><td colspan="5">Записей журнала пока нет.</td></tr>';
};
const loadPlots = async () => { registry = await api('/api/admin/plots'); renderPlotSummary(); renderPlots(); setMessage(plotMessage, 'Реестр загружен.', 'success'); };
const loadAudit = async () => { auditEntries = (await api('/api/admin/audit-log')).entries; renderAudit(); setMessage(auditMessage, 'Журнал действий загружен.', 'success'); };
const showApp = async () => { loginPanel.hidden = true; app.hidden = false; await Promise.all([loadPlots(), loadAudit()]); };

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginMessage.textContent = 'Проверяем данные…';
  try { await api('/api/admin/login', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(loginForm))) }); await showApp(); } catch (error) { loginMessage.textContent = error.message; }
});
$('[data-logout]').addEventListener('click', async () => { await api('/api/admin/logout', { method: 'POST' }); app.hidden = true; loginPanel.hidden = false; loginForm.reset(); });
$('[data-revoke-all]').addEventListener('click', async () => {
  if (!window.confirm('Завершить все активные сессии админки? На каждом устройстве потребуется войти заново.')) return;
  try { await api('/api/admin/sessions/revoke-all', { method: 'POST' }); app.hidden = true; loginPanel.hidden = false; loginForm.reset(); loginMessage.textContent = 'Все сессии завершены. Войдите снова.'; } catch (error) { alert(error.message); }
});
document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', async () => {
  document.querySelectorAll('[data-tab]').forEach((item) => item.classList.toggle('is-active', item === button));
  document.querySelectorAll('[data-panel]').forEach((panel) => { panel.hidden = panel.dataset.panel !== button.dataset.tab; });
  if (button.dataset.tab === 'audit') await loadAudit();
}));
$('[data-plot-search]').addEventListener('input', renderPlots);
$('[data-plot-filter]').addEventListener('change', renderPlots);
$('[data-plots-table]').addEventListener('click', async (event) => {
  const button = event.target.closest('[data-plot-id]');
  if (!button) return;
  const select = document.querySelector(`[data-plot-status="${button.dataset.plotId}"]`);
  button.disabled = true;
  try { registry = await api(`/api/admin/plots/${button.dataset.plotId}`, { method: 'PUT', body: JSON.stringify({ status: select.value }) }); renderPlotSummary(); renderPlots(); await loadAudit(); setMessage(plotMessage, `Статус участка №${button.dataset.plotId} обновлён.`, 'success'); } catch (error) { setMessage(plotMessage, error.message, 'error'); button.disabled = false; }
});

api('/api/admin/plots').then(() => showApp()).catch(() => {});
