// The counter is deliberately not committed to source code. It is supplied only
// for the production build after the real domain and the new Metrika counter
// have been created: VITE_METRIKA_ID=12345678.
const METRIKA_ID = Number(import.meta.env.VITE_METRIKA_ID || 0);
const analyticsEnabled = Number.isInteger(METRIKA_ID) && METRIKA_ID > 0;
const consentKey = 'novo-borodino-analytics-consent';
const consentVersion = '2026-08-17';

const readConsent = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(consentKey) || 'null');
    return stored?.version === consentVersion && ['accepted', 'rejected'].includes(stored.choice) ? stored.choice : null;
  } catch {
    return null;
  }
};

const saveConsent = (choice) => localStorage.setItem(consentKey, JSON.stringify({
  choice,
  version: consentVersion,
  savedAt: new Date().toISOString(),
}));

const loadMetrika = () => {
  if (window.__novoBorodinoMetrikaLoaded) return;
  window.__novoBorodinoMetrikaLoaded = true;
  window.ym = window.ym || function metrikaQueue(...args) {
    (window.ym.a = window.ym.a || []).push(args);
  };
  window.ym.l = Date.now();

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://mc.yandex.ru/metrika/tag.js';
  script.onload = () => window.ym(METRIKA_ID, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true });
  document.head.append(script);
};

const bannerMarkup = () => `
  <section class="cookie-banner" data-cookie-banner role="dialog" aria-modal="false" aria-label="Настройки cookie" aria-live="polite" hidden>
    <p><strong>Cookie и аналитика</strong><span>Яндекс Метрика включается только после вашего согласия. Подробнее — на странице <a href="/cookie-i-analitika/">«Cookie и аналитика»</a>.</span></p>
    <div class="cookie-banner__actions"><button class="button button--dark button--small" type="button" data-cookie-choice="accepted">Принять аналитику</button><button class="button button--cookie button--small" type="button" data-cookie-choice="rejected">Отклонить</button></div>
  </section>`;

export const initAnalyticsConsent = () => {
  // No analytics is active on previews or until the production counter exists.
  // In that state there is no non-essential cookie to ask permission for.
  if (!analyticsEnabled) return;
  if (document.querySelector('[data-cookie-banner]')) return;
  document.body.insertAdjacentHTML('beforeend', bannerMarkup());
  const banner = document.querySelector('[data-cookie-banner]');
  const savedChoice = readConsent();

  const applyChoice = (choice, wasOpen = false) => {
    saveConsent(choice);
    banner.hidden = true;
    if (choice === 'accepted') loadMetrika();
    if (choice === 'rejected' && window.__novoBorodinoMetrikaLoaded && wasOpen) window.location.reload();
  };

  if (savedChoice === 'accepted') loadMetrika();
  else if (!savedChoice) banner.hidden = false;

  banner.addEventListener('click', (event) => {
    const choice = event.target.closest('[data-cookie-choice]')?.dataset.cookieChoice;
    if (choice) applyChoice(choice, true);
  });

  document.addEventListener('click', (event) => {
    const settingsButton = event.target.closest('[data-cookie-settings]');
    if (!settingsButton) return;
    event.preventDefault();
    banner.hidden = false;
    banner.querySelector('[data-cookie-choice="accepted"]')?.focus();
  });
};

export const reachMetrikaGoal = (goal, params = {}) => {
  if (analyticsEnabled && readConsent() === 'accepted' && typeof window.ym === 'function') {
    window.ym(METRIKA_ID, 'reachGoal', goal, params);
  }
};
