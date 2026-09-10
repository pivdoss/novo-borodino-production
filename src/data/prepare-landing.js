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
  .replace('В одном предложении объединены 71 участок площадью 5,2 га и 1 га внутренних дорог. Массив продаётся целиком одним лотом.', 'В одном предложении объединены 71 участок площадью 5,2 га и 1 га внутренних дорог. <span class="copy-accent">Массив продаётся целиком одним лотом.</span>')
  .replace('По объекту подготовлен комплект подтверждающих материалов: реестр 71 участка, актуальные выписки, документы на внутренние дороги, сведения об электроснабжении, согласования Минкультуры и материалы археологических работ.', '<span class="copy-accent">По объекту подготовлен комплект подтверждающих материалов:</span> реестр 71 участка, актуальные выписки, документы на внутренние дороги, сведения об электроснабжении, согласования Минкультуры и материалы археологических работ.')
  .replace('Получите документы и исходные данные по объекту до разговора о просмотре и условиях сделки.', '<span class="copy-accent">Получите документы</span> и исходные данные по объекту до разговора о просмотре и условиях сделки.')
  .replace('71 участок общей площадью 5,2 га и 1 га внутренних дорог образуют единый продаваемый актив. Площадь участков — от 5 до 10 соток. Продаваемая территория на схеме выделена красным контуром.', '<span class="copy-accent">71 участок</span> общей площадью <span class="copy-accent">5,2 га</span> и 1 га внутренних дорог образуют единый продаваемый актив. <span class="copy-accent">Площадь участков — от 5 до 10 соток.</span> Продаваемая территория на схеме выделена красным контуром.')
  .replace(territoryControls, '')
  .replace(/\s*<div class="lot-container lot-concept__caption">[\s\S]*?<\/div><\/section>/, '</section>')
  .replace(/\s*<a class="transition-rail" href="#facts"><span class="lot-container">[\s\S]*?<\/span><\/a>/, '')
  .replace('Документы дают факты. Визуализации показывают потенциал. ↓', 'Посмотреть возможный сценарий развития ↓')
  .replace('1,5–2 км до побережья Можайского водохранилища.', '1,5 км до побережья Можайского водохранилища.')
  .replace('<div class="lot-container actual-slider__controls"><button type="button" data-actual-prev aria-label="Предыдущее фото">‹</button><span data-actual-count aria-live="off">01 / 09</span><button type="button" data-actual-pause aria-pressed="false">Пауза</button><button type="button" data-actual-next aria-label="Следующее фото">›</button></div>', '<div class="lot-container actual-slider__controls"><div class="actual-slider__buttons"><button type="button" data-actual-prev aria-label="Предыдущее фото">‹</button><button type="button" data-actual-pause aria-pressed="false">Пауза</button><button type="button" data-actual-next aria-label="Следующее фото">›</button></div><span data-actual-count aria-live="off">01 / 09</span></div>')
  .replace(/\s*<a class="section-next" href="#location">[\s\S]*?<\/a>/, '')
  .replace(/\s*<a class="section-next" href="#actual">[\s\S]*?<\/a>/, '');
