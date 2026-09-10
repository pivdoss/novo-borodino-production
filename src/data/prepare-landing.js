import { chapters } from './chapters.js';

const territoryControls = '<div class="lot-container"><div class="conveyor-controls"><span>5 аэрофотографий · листайте или перетаскивайте</span><div><button type="button" data-conveyor-prev aria-label="Предыдущий кадр">‹</button><button type="button" data-conveyor-pause aria-pressed="false">Пауза</button><button type="button" data-conveyor-next aria-label="Следующий кадр">›</button></div></div></div>';

const markerReplacements = Object.freeze([
  ['01 / Состав предложения', chapters.asset],
  ['02 / Схема массива', chapters.concept],
  ['Территория с высоты', chapters.territory],
  ['03 / Юридическая готовность', chapters.facts],
  ['Для предметного разговора', chapters.materials],
  ['05 / Возможный сценарий', chapters.visualizations],
  ['07 / Локация', chapters.location],
  ['08 / Территория сегодня', chapters.actual],
  ['Перед первым разговором', chapters.questions],
  ['09 / Личный контакт', chapters.contacts],
]);

export const prepareLandingMarkup = (markup) => markerReplacements
  .reduce((output, [source, label]) => output.replace(source, label), markup)
  .replace(territoryControls, '')
  .replace(/\s*<a class="transition-rail" href="#facts"><span class="lot-container">[\s\S]*?<\/span><\/a>/, '')
  .replace('Документы дают факты. Визуализации показывают потенциал. ↓', 'Посмотреть возможный сценарий развития ↓')
  .replace(/\s*<a class="section-next" href="#location">[\s\S]*?<\/a>/, '')
  .replace(/\s*<a class="section-next" href="#actual">[\s\S]*?<\/a>/, '');
