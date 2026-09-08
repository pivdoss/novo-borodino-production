import { contacts, phoneHref, withOfferMessage } from './data/contacts.js';
const external = 'target="_blank" rel="noopener noreferrer"';
const request = (text) => withOfferMessage(contacts.whatsappUrl,text);
export const investorHero = `
<section class="lot-hero" id="top" aria-labelledby="page-title">
  <img src="/images/hero-novoe-borodino.webp" srcset="/images/responsive/hero-800.webp 800w, /images/hero-novoe-borodino.webp 1536w" sizes="100vw" alt="Аэрофотография территории Нового Бородино" width="1536" height="1024" fetchpriority="high">
  <div class="lot-hero__shade"></div>
  <div class="lot-container lot-hero__content">
    <p class="lot-kicker">Можайское водохранилище · От собственника</p>
    <h1 id="page-title">Массив <em>6,2 га</em><br> под коттеджный посёлок.</h1>
    <p class="lot-hero__lead">71 размежёванный участок и 1 га дорог в собственности.<br>Согласования Минкульта получены. Электросеть заведена. Внутренние дороги построены.</p>
    <div class="lot-hero__offer"><strong>55 млн ₽</strong><span>Стоимость единого лота<br>105 км от МКАД · Можайский район</span></div>
    <div class="lot-actions"><a class="lot-button lot-button--accent" href="${withOfferMessage(contacts.telegramUrl,'инвестиционная презентация и схема массива 6,2 га в Новом Бородино')}" ${external} data-contact-channel="telegram" data-event="lead_hero_memo">Презентация в Telegram ↗</a><a class="lot-text-link lot-text-link--light" href="${request('презентация и схема массива 6,2 га в Новом Бородино')}" ${external} data-contact-channel="whatsapp" data-event="lead_hero_memo">Написать в WhatsApp ↗</a></div>
    <p class="lot-hero__cta-note">Откроется диалог с Екатериной. Или <a href="${phoneHref}" data-contact-channel="phone">позвоните: ${contacts.phone}</a>.</p>
  </div><div class="lot-hero__bottom lot-container"><span>Единый актив для девелопера</span><a href="#asset">Изучить состав лота ↓</a></div>
</section>`;
export const diligence = `
<section class="lot-section lot-section--ink" id="facts" aria-labelledby="facts-title"><div class="lot-container">
  <div class="lot-heading"><div><p class="lot-kicker">03 / Юридическая основа</p><h2 id="facts-title">Согласования получены.<br><em>Документы для проверки.</em></h2></div><p>По сведениям собственника, согласования Минкульта и археологические работы завершены. До сделки важно проверить актуальные документы, их границы действия и соответствие вашему проекту.</p></div>
  <div class="lot-facts-grid"><article><span>01</span><h3>Минкульт и археология</h3><p>Согласования Министерства культуры и официальные отчёты по шурфованию предоставляются напрямую. Проверка включает выводы документов и границы исследованной территории.</p></article><article><span>02</span><h3>Категория и ВРИ</h3><p>По данным собственника: земли сельскохозяйственного назначения, зона СХ-2, ВРИ 13.2 «Ведение садоводства». Параметры жилой застройки уточняются по выпискам и действующим градостроительным требованиям.</p></article><article><span>03</span><h3>Один собственник</h3><p>71 участок и внутренние дороги продаются одним лотом. Состав имущества, зарегистрированные права и ограничения сверяются по актуальным выпискам перед подписанием договора.</p></article></div>
  <a class="lot-text-link" href="${request('копии согласований Минкульта и отчётов по археологическому шурфованию массива в Новом Бородино')}" ${external} data-contact-channel="whatsapp" data-event="lead_due_diligence">Запросить согласования и отчёты ↗</a>
</div></section>
<section class="lot-section lot-engineering" id="engineering" aria-labelledby="engineering-title"><div class="lot-container">
  <div class="lot-heading"><div><p class="lot-kicker">Инженерия и подъезды</p><h2 id="engineering-title">Не только земля.<br><em>База для развития.</em></h2></div><p>Существующая дорожная сеть и заведённое электричество позволяют обсуждать конкретную подготовку проекта. Объём последующих вложений определяется после технической проверки.</p></div>
  <div class="engineering-grid"><article><h3>1 га внутренних дорог</h3><p>Размежёваны, находятся в собственности и входят в цену. По сведениям собственника, внутри посёлка построены дороги с твёрдым грунтовым основанием.</p></article><article><h3>Электросеть на территории</h3><p>Технические условия получены, сеть заведена в посёлок. Доступную мощность, стоимость и порядок подключения будущих домов уточните по ТУ.</p></article><article><h3>Вода и водоотведение</h3><p>Для проекта можно рассмотреть локальные скважины и автономную очистку. Решения, производительность и бюджет требуют изысканий и проектирования.</p></article></div>
  <a class="lot-text-link" href="${request('реестр 71 участка с площадями и технические условия на электроснабжение')}" ${external} data-contact-channel="whatsapp" data-event="lead_cadastre_registry">Запросить реестр участков и ТУ ↗</a>
</div></section>`;
export const economics = `
<section class="lot-section lot-chapters" id="scenarios" aria-labelledby="chapters-title"><div class="lot-container">
  <div class="lot-heading"><div><p class="lot-kicker">Экономика входа</p><h2 id="chapters-title">Один массив.<br><em>Четыре модели развития.</em></h2></div><p>55 млн ₽ — цена земли и дорог, не бюджет готового посёлка. Выбор модели зависит от правовых условий, затрат на строительство и реального спроса.</p></div>
  <div class="economics-base"><p><strong>≈ 775 тыс. ₽</strong><span>на один из 71 участка, включая долю стоимости дорог</span></p><p><strong>≈ 88,7 тыс. ₽</strong><span>за сотку общей площади 6,2 га, включая дороги</span></p><p class="action-note">Расчёт: 55 млн ₽ ÷ 71 участок и ÷ 620 соток. Это распределение цены лота, а не предложение розничной продажи.</p></div>
  <ol class="lot-chapters__list"><li><span>01</span><h3>Посёлок полного цикла</h3><p>Единая архитектура и строительство домов под продажу. Модель требует расчёта себестоимости, инженерии, благоустройства и реализации.</p></li><li><span>02</span><h3>Поэтапная застройка</h3><p>Пилотная очередь и дальнейшее развитие по результатам продаж. Размер очередей и потребность в капитале определяются финансовой моделью.</p></li><li><span>03</span><h3>Сервис и управление</h3><p>Организация эксплуатации дорог и общих сервисов. Состав услуг, договорная модель и экономика обсуждаются отдельно.</p></li><li><span>04</span><h3>Развитие под розницу</h3><p>Подготовка участков к дальнейшей реализации. Цены и сроки продаж требуют исследования рынка; доходность не гарантируется.</p></li></ol>
  <a class="lot-text-link" href="${request('исходные данные для расчёта финансовой модели развития массива 6,2 га')}" ${external} data-contact-channel="whatsapp" data-event="lead_fin_model">Обсудить исходные данные для расчёта ↗</a>
</div></section>`;
