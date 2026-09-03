import { initAnalyticsConsent } from './analytics.js';
import { initOfferCopyButtons } from './contact-copy.js';

initAnalyticsConsent();
initOfferCopyButtons();

const menuToggle = document.querySelector('[data-page-menu-toggle]');
const mobileMenu = document.querySelector('[data-page-mobile-menu]');

const publicPlotsTable = document.querySelector('[data-public-plots]');
if (publicPlotsTable) {
  const publicPlotsUpdated = document.querySelector('[data-public-plots-updated]');
  const publicPlotsToggle = document.querySelector('[data-public-plots-toggle]');
  const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });
  const money = new Intl.NumberFormat('ru-RU');
  const compactRowsCount = 8;
  let availablePlots = [];
  let registryData;
  let listExpanded = false;

  const renderPublicPlots = () => {
    const shownPlots = listExpanded ? availablePlots : availablePlots.slice(0, compactRowsCount);
    publicPlotsTable.innerHTML = availablePlots.length
      ? shownPlots.map((plot) => {
        const price = Math.round(plot.areaSotka * registryData.pricePerSotka);
        const offer = `Участок №${plot.id} · ${number.format(plot.areaSotka)} соток · ${money.format(price)} ₽`;
        return `<tr><th scope="row">№${plot.id}</th><td>${number.format(plot.areaSotka)} соток</td><td>${money.format(price)} ₽</td><td>${registryData.landUse}</td><td>${plot.cadastralRef || 'Не указано на схеме'}</td><td><a class="seo-table__cta" href="/?offer=${encodeURIComponent(offer)}#contacts">Обсудить участок №${plot.id}</a></td></tr>`;
      }).join('')
      : '<tr><td colspan="6">Свободных участков в реестре сейчас нет.</td></tr>';

    if (!publicPlotsToggle) return;
    const canExpand = availablePlots.length > compactRowsCount;
    publicPlotsToggle.hidden = !canExpand;
    publicPlotsToggle.setAttribute('aria-expanded', String(listExpanded));
    publicPlotsToggle.textContent = listExpanded
      ? 'Свернуть список участков'
      : `Показать ещё ${availablePlots.length - compactRowsCount} участков`;
  };

  publicPlotsToggle?.addEventListener('click', () => {
    listExpanded = !listExpanded;
    renderPublicPlots();
  });

  fetch('/api/public/plots', { cache: 'no-store' }).then(async (response) => {
    if (!response.ok) return;
    registryData = await response.json();
    availablePlots = registryData.plots.filter((plot) => plot.status === 'available');
    renderPublicPlots();
    if (publicPlotsUpdated) publicPlotsUpdated.textContent = `Таблица сформирована из единого реестра сайта и обновлена ${registryData.updatedAt.split('-').reverse().join('.')}.`;
  }).catch(() => { /* Статическая таблица остаётся доступной при временном сбое API. */ });
}

if (menuToggle && mobileMenu) {
  const setMenu = (open) => {
    mobileMenu.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.classList.toggle('menu-open', open);
  };
  menuToggle.addEventListener('click', () => setMenu(mobileMenu.hidden));
  mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !mobileMenu.hidden) { setMenu(false); menuToggle.focus(); }
  });
}

document.querySelectorAll('[data-seo-gallery]').forEach((gallery) => {
  const track = gallery.querySelector('[data-seo-gallery-track]');
  const scroll = (direction) => track.scrollBy({ left: direction * track.clientWidth, behavior: 'smooth' });
  gallery.querySelector('[data-seo-gallery-prev]')?.addEventListener('click', () => scroll(-1));
  gallery.querySelector('[data-seo-gallery-next]')?.addEventListener('click', () => scroll(1));
});
