import { contacts, phoneHref, withOfferMessage } from './data/contacts.js';

const arrow = '<span aria-hidden="true">↗</span>';
const offer = 'земельный актив 6,2 га в «Новом Бородино»';
const whatsapp = contacts.whatsappUrl;
const telegram = contacts.telegramUrl;
const max = contacts.maxUrl;
const presentationContact = withOfferMessage(whatsapp, `инвестиционная презентация по объекту ${offer}`);
const materialsContact = withOfferMessage(whatsapp, `материалы для проверки по объекту ${offer}`);
const viewingContact = withOfferMessage(whatsapp, `просмотр массива ${offer}`);

export const landingMarkup = () => `
  <a class="skip-link" href="#content">Перейти к содержимому</a>
  <header class="lot-header" data-lot-header>
    <div class="lot-container lot-header__inner">
      <a class="lot-brand" href="#top" aria-label="Новое Бородино — к началу страницы"><span>НБ</span><b>Новое<br>Бородино</b></a>
      <nav class="lot-nav" aria-label="Навигация по странице">
        <a href="#territory">Об объекте</a><a href="#concept">Возможности</a><a href="#actual">Территория</a><a href="#location">Локация</a>
      </nav>
      <a class="lot-header__phone" href="${phoneHref}">${contacts.phone}<small>ежедневно 09:00–20:00</small></a>
      <a class="lot-button lot-button--dark lot-header__cta" href="${viewingContact}" target="_blank" rel="noreferrer" data-contact-channel="whatsapp" data-event="viewing_request">Назначить просмотр</a>
      <button class="lot-menu" type="button" data-lot-menu aria-expanded="false" aria-controls="lot-mobile-menu"><i></i><i></i><span class="visually-hidden">Открыть меню</span></button>
    </div>
    <nav class="lot-mobile-nav" id="lot-mobile-menu" data-lot-mobile-menu hidden aria-label="Мобильная навигация">
      <div class="lot-mobile-nav__top"><span>Меню</span><button type="button" data-lot-menu-close aria-label="Закрыть меню">×</button></div>
      <a href="#territory">Об объекте</a><a href="#concept">Возможности</a><a href="#actual">Территория</a><a href="#location">Локация</a>
      <a class="lot-button lot-button--accent" href="${viewingContact}" target="_blank" rel="noreferrer" data-contact-channel="whatsapp">Назначить просмотр ${arrow}</a>
      <a class="lot-mobile-nav__phone" href="${phoneHref}">${contacts.phone}<small>ежедневно 09:00–20:00</small></a>
    </nav>
  </header>
  <a class="lot-sticky-cta" href="${materialsContact}" target="_blank" rel="noreferrer" data-sticky-cta data-contact-channel="whatsapp" data-event="materials_request" data-before-label="Запросить материалы" data-before-href="${materialsContact}" data-location-label="Назначить просмотр" data-location-href="${viewingContact}"><span data-sticky-label>Запросить материалы</span> <span aria-hidden="true">↗</span></a>

  <main id="content">
    <section class="lot-hero" id="top" aria-labelledby="page-title">
      <img src="/images/hero-novoe-borodino.webp" alt="Аэрофотография территории Нового Бородино" fetchpriority="high" width="1536" height="1024">
      <div class="lot-hero__shade"></div>
      <div class="lot-container lot-hero__content">
        <p class="lot-kicker lot-kicker--light">Земельный актив · Можайский район</p>
        <h1 id="page-title">Большой проект не собирают<br><em>из маленьких решений.</em></h1>
        <p class="lot-hero__lead">Единый земельный массив 6,2 га в Можайском районе: 71 участок под застройку и 1 га внутренних дорог. Территория продаётся одним лотом от собственника.</p>
        <div class="lot-actions"><a class="lot-button lot-button--accent" href="${presentationContact}" target="_blank" rel="noreferrer" data-event="presentation_request" data-contact-channel="whatsapp">Получить презентацию проекта ${arrow}</a><a class="lot-text-link lot-text-link--light lot-hero__secondary-action" href="#asset" data-event="territory_view">Посмотреть, что входит в состав лота <span aria-hidden="true">↓</span></a><p class="lot-hero__cta-note">Откроется WhatsApp с готовым сообщением для Екатерины.</p></div>
        <dl class="lot-hero__facts"><div><dt>6,2 га</dt><dd>общий массив</dd></div><div><dt>71 участок</dt><dd>под застройку</dd></div><div><dt>1 га</dt><dd>внутренние дороги</dd></div><div><dt>55 млн ₽</dt><dd>единый лот</dd></div></dl><p class="lot-hero__owner-note">Прямая продажа от собственника.</p>
      </div>
      <p class="lot-hero__caption">REAL · аэрофотография территории из материалов проекта.</p>
      <a class="lot-scroll" href="#territory">Листайте ниже <span>↓</span></a>
    </section>

    <section class="lot-section lot-asset" id="asset" aria-labelledby="asset-title">
      <div class="lot-container lot-asset__grid"><div><p class="lot-kicker">02 — единый актив</p><h2 id="asset-title">Единая территория.<br><em>Понятная структура.</em></h2></div><div><p>Вместо переговоров с множеством собственников и объединения разрозненных участков — единая территория с понятным составом. Один собственник, один лот, один процесс сделки.</p><dl><div><dt>Единый контур</dt><dd>6,2 га в составе одного актива</dd></div><div><dt>Понятная структура</dt><dd>71 участок и 1 га дорог</dd></div><div><dt>Один процесс сделки</dt><dd>продажа объекта целиком</dd></div></dl><a class="lot-text-link" href="#concept" data-event="territory_view">Изучить состав территории ${arrow}</a></div></div>
    </section>

    <section class="lot-section lot-context" id="territory" aria-labelledby="territory-title">
      <div class="lot-container">
        <div class="lot-spatial lot-spatial--photo-only" data-spatial>
          <div class="lot-spatial__stage">
            <figure class="lot-spatial__layer lot-spatial__layer--gallery is-active" id="spatial-aerial" data-spatial-layer="aerial" role="group">
              <div class="territory-slider" data-territory-slider tabindex="0" aria-label="Панорама фотографий территории Нового Бородино">
                <div class="territory-slider__track" data-territory-track>
                  <img src="/images/territory/territory-slide-01.webp" alt="Аэрофотография территории Нового Бородино — вид 1" loading="lazy" width="1448" height="1086">
                  <img src="/images/territory/territory-slide-02.webp" alt="Аэрофотография территории Нового Бородино — вид 2" loading="lazy" width="1601" height="983">
                  <img src="/images/territory/territory-slide-03.webp" alt="Аэрофотография территории Нового Бородино — вид 3" loading="lazy" width="1448" height="1086">
                  <img src="/images/territory/territory-slide-04.webp" alt="Аэрофотография территории Нового Бородино — вид 4" loading="lazy" width="1481" height="1062">
                  <img src="/images/territory/territory-slide-05.webp" alt="Аэрофотография территории Нового Бородино — вид 5" loading="lazy" width="1511" height="1041">
                  <img src="/images/territory/territory-slide-06.webp" alt="Аэрофотография территории Нового Бородино — вид 6" loading="lazy" width="1448" height="1086">
                  <img src="/images/territory/territory-slide-01.webp" alt="" aria-hidden="true" loading="lazy" width="1448" height="1086">
                  <img src="/images/territory/territory-slide-02.webp" alt="" aria-hidden="true" loading="lazy" width="1601" height="983">
                  <img src="/images/territory/territory-slide-03.webp" alt="" aria-hidden="true" loading="lazy" width="1448" height="1086">
                  <img src="/images/territory/territory-slide-04.webp" alt="" aria-hidden="true" loading="lazy" width="1481" height="1062">
                  <img src="/images/territory/territory-slide-05.webp" alt="" aria-hidden="true" loading="lazy" width="1511" height="1041">
                  <img src="/images/territory/territory-slide-06.webp" alt="" aria-hidden="true" loading="lazy" width="1448" height="1086">
                </div>
              </div>
            </figure>
            <div class="lot-spatial__overlay">
              <div class="lot-heading lot-heading--overlay"><div><p class="lot-kicker lot-kicker--light">01 — территория</p><h2 id="territory-title">Один массив.<br><em>Единая территория.</em></h2></div><p>Пространство, которому не нужен заранее заданный сценарий. Сопоставьте реальный вид, схему деления и точный контур объекта.</p></div>
              <div class="lot-stats" aria-label="Ключевые характеристики актива"><div><strong>6,2 га</strong><span>полный контур объекта</span></div><div><strong>5,2 га</strong><span>участки под застройку</span></div><div><strong>1 га</strong><span>внутренние дороги</span></div><div><strong>71 участок</strong><span>в составе актива</span></div></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="lot-section lot-chapters" aria-labelledby="chapters-title">
      <div class="lot-container">
        <div class="lot-heading"><div><p class="lot-kicker">03 — возможности</p><h2 id="chapters-title">Сценарий<br><em>задаёте вы.</em></h2></div><p>Единый массив даёт возможность планировать проект целиком: определять последовательность развития, формат продукта и собственную модель использования территории.</p></div>
        <ol class="lot-chapters__list">
          <li><span>01</span><div><h3>Собственный проект</h3><p>Возможный сценарий после проверки документов и параметров земли.</p></div></li>
          <li><span>02</span><div><h3>Поэтапное развитие</h3><p>Возможный сценарий после проверки документов и параметров земли.</p></div></li>
          <li><span>03</span><div><h3>Коттеджный посёлок</h3><p>Возможный сценарий после проверки документов и параметров земли.</p></div></li>
          <li><span>04</span><div><h3>Долгосрочный земельный актив</h3><p>Возможный сценарий после проверки документов и параметров земли.</p></div></li>
        </ol>
        <a class="lot-text-link" href="#facts" data-event="facts_view">Посмотреть фактическую основу ${arrow}</a>
      </div>
    </section>

    <section class="lot-section lot-section--ink" id="facts" aria-labelledby="facts-title">
      <div class="lot-container">
        <div class="lot-heading lot-heading--light"><div><p class="lot-kicker lot-kicker--light">04 — готовность территории</p><h2 id="facts-title">Территория уже собрана<br><em>в понятную структуру.</em></h2></div><p>В составе объекта выделены участки под застройку и внутренние дороги. Доступные документы, кадастровые сведения и технические параметры предоставляются для предметной проверки.</p></div>
        <div class="lot-facts-grid">
          <article><span>01</span><h3>Межевание</h3><p>В составе объекта выделены 71 участок под застройку; кадастровые сведения доступны для проверки.</p></article>
          <article><span>02</span><h3>Внутренние дороги</h3><p>1 га внутренних дорог входит в общий контур актива; параметры подтверждаются материалами проекта.</p></article>
          <article><span>03</span><h3>Электрическая сеть</h3><p>Технические условия и актуальные параметры подключения предоставляются для предметной проверки.</p></article>
        </div>
        <details class="lot-facts-details"><summary>Уточняемые параметры <span>↓</span></summary><div><p><b>Водоснабжение, канализация, связь и интернет.</b> Возможность подключения и доступные решения уточняются по актуальным материалам проекта.</p><a class="lot-text-link lot-text-link--light" href="${materialsContact}" target="_blank" rel="noreferrer" data-contact-channel="whatsapp" data-event="materials_request">Запросить материалы для проверки ${arrow}</a></div></details>
      </div>
    </section>

    <section class="lot-section lot-materials" aria-labelledby="materials-title">
      <div class="lot-container lot-materials__inner"><div><p class="lot-kicker">Для предметного решения</p><h2 id="materials-title">Материалы<br><em>для инвестиционной проверки.</em></h2></div><div><p>Пакет помогает изучить состав актива, исходные документы и порядок сделки до личного просмотра территории.</p><ul><li>кадастровые номера и выписки;</li><li>схема массива 6,2 га;</li><li>документы на внутренние дороги;</li><li>технические условия и параметры электроснабжения;</li><li>материалы Минкульта и археологии;</li><li>порядок сделки и дата актуальности.</li></ul><a class="lot-text-link lot-text-link--light" href="${materialsContact}" target="_blank" rel="noreferrer" data-contact-channel="whatsapp" data-event="materials_request">Запросить материалы в WhatsApp ${arrow}</a></div></div>
    </section>

    <section class="lot-section lot-concept" id="concept" aria-labelledby="concept-title">
      <div class="lot-container">
        <div class="lot-concept__full" data-concept-canvas>
          <h2 id="concept-title" class="visually-hidden">Один массив — единая логика</h2>
          <img src="/images/concept-scheme.webp" alt="Схема единого земельного актива 6,2 га с дорогами и участками" loading="lazy" width="1980" height="1106">
        </div>
        <div class="lot-concept__caption"><p><b>На схеме показан состав единого лота</b> и его расположение внутри существующей планировки.</p><p>Красным контуром выделена территория, входящая в состав объекта. Актуальные параметры подтверждаются документами.</p><div><button class="lot-text-link" type="button" data-concept-open data-event="masterplan_open">Открыть схему крупно ${arrow}</button><a class="lot-text-link" href="#actual" data-event="gallery_view">Посмотреть реальную территорию ${arrow}</a></div></div>
      </div>
    </section>

    <section class="lot-section lot-render-conveyor" id="visualizations" aria-labelledby="visualizations-title">
      <div class="lot-container">
        <div class="lot-heading lot-heading--light"><div><p class="lot-kicker lot-kicker--light">05 — возможный сценарий</p><h2 id="visualizations-title">Как может выглядеть<br><em>этот актив.</em></h2></div><p>Каркасные визуализации показывают один из возможных сценариев развития территории. Это концепция для обсуждения, а не обещание готовой застройки.</p></div>
        <div class="render-conveyor" data-render-conveyor tabindex="0" aria-label="Каркасные визуализации возможного развития территории">
          <div class="render-conveyor__track" data-render-track>
            ${['1','2','3','4','5','6','7','8','9','10','11','12','12-2','13','14'].map((name) => { const label = name === '12-2' ? '12 (2)' : name; return `<figure><img src="/images/renders/${name}.png" alt="Каркасная визуализация сценария развития территории — кадр ${label}" loading="lazy" width="1920" height="1080"><figcaption>Возможный сценарий · кадр ${label}</figcaption></figure>`; }).join('')}
          </div>
        </div>
      </div>
    </section>

    <section class="lot-section lot-section--paper" id="actual" aria-labelledby="actual-title">
      <div class="lot-container">
        <div class="lot-heading"><div><p class="lot-kicker">05 — территория сегодня</p><h2 id="actual-title">Территория<br><em>в деталях.</em></h2></div><p>Подъезд, внутренние дороги и окружающий ландшафт показаны на реальных фотографиях из материалов проекта.</p></div>
        <div class="actual-slider" data-actual-slider aria-label="Фотографии территории и подъездов">
          <div class="actual-slider__track" data-actual-track>
            <figure><img src="/images/actual-gallery/actual-01.webp" alt="Внутренняя территория посёлка — вид 1" loading="lazy" width="1920" height="1440"><figcaption>Внутренняя территория</figcaption></figure>
            <figure><img src="/images/actual-gallery/actual-02.webp" alt="Внутренняя территория посёлка — вид 2" loading="lazy" width="1920" height="1440"><figcaption>Внутренняя территория</figcaption></figure>
            <figure><img src="/images/actual-gallery/actual-03.webp" alt="Внутренняя территория посёлка — вид 3" loading="lazy" width="1920" height="1440"><figcaption>Внутренняя территория</figcaption></figure>
            <figure><img src="/images/actual-gallery/actual-04.webp" alt="Внутренняя территория посёлка — вид 4" loading="lazy" width="1920" height="1440"><figcaption>Внутренняя территория</figcaption></figure>
            <figure><img src="/images/actual-gallery/actual-05.webp" alt="Внутренняя территория посёлка — вид 5" loading="lazy" width="1280" height="960"><figcaption>Внутренняя территория</figcaption></figure>
            <figure><img src="/images/actual-gallery/actual-06.webp" alt="Въезд на территорию" loading="lazy" width="1440" height="1920"><figcaption>Въезд на территорию</figcaption></figure>
            <figure><img src="/images/actual-gallery/actual-07.webp" alt="Лес рядом с территорией" loading="lazy" width="1650" height="2200"><figcaption>Лес рядом</figcaption></figure>
            <figure><img src="/images/actual-gallery/actual-08.webp" alt="Можайское водохранилище" loading="lazy" width="1029" height="718"><figcaption>Можайское водохранилище</figcaption></figure>
            <figure><img src="/images/actual-gallery/actual-09.webp" alt="Можайское водохранилище — вид 2" loading="lazy" width="2200" height="1650"><figcaption>Можайское водохранилище</figcaption></figure>
            <figure><img src="/images/actual-gallery/actual-10.webp" alt="Подъезд к территории" loading="lazy" width="1920" height="1440"><figcaption>Подъезд к территории</figcaption></figure>
          </div>
          <button class="actual-slider__side-control actual-slider__side-control--prev" type="button" data-actual-prev aria-label="Предыдущее фото"><span aria-hidden="true">←</span></button>
          <button class="actual-slider__side-control actual-slider__side-control--next" type="button" data-actual-next aria-label="Следующее фото"><span aria-hidden="true">→</span></button>
          <div class="actual-slider__controls" aria-label="Номер фотографии"><span data-actual-count>01 / 10</span></div>
        </div>
      </div>
    </section>

    <section class="lot-section lot-location" id="location" aria-labelledby="location-title">
      <div class="lot-container lot-location__grid">
        <div class="lot-location__editorial"><p class="lot-kicker">06 — локация</p><h2 id="location-title">Не просто участок,<br><em>а территория для проекта.</em></h2><p>6,2 га в Можайском районе, рядом с лесом, водохранилищем и историческими объектами Бородинского края.</p><dl><div><dt>105 км</dt><dd>от МКАД</dd></div><div><dt>20 км</dt><dd>до Можайска</dd></div></dl><div class="lot-location__actions"><a class="lot-button lot-button--accent" href="${viewingContact}" target="_blank" rel="noreferrer" data-contact-channel="whatsapp" data-event="viewing_request">Назначить просмотр ${arrow}</a><a class="lot-text-link" href="https://yandex.ru/maps/?ll=35.720800%2C55.602600&z=15&pt=35.720800%2C55.602600%2Cpm2rdm" target="_blank" rel="noreferrer" data-event="route_open">Построить маршрут ${arrow}</a></div></div>
        <div class="lot-map" data-lot-map aria-label="Карта расположения Нового Бородино"><div class="lot-map__fallback"><img src="/images/location-map-yandex.webp" alt="Карта маршрута от Москвы к Новому Бородино" width="650" height="450"></div><iframe title="Новое Бородино на Яндекс Картах" src="https://yandex.ru/map-widget/v1/?ll=35.720800%2C55.602600&amp;z=12&amp;pt=35.720800%2C55.602600%2Cpm2rdm" loading="lazy"></iframe></div>
      </div>
    </section>

    <section class="lot-contact" id="contacts" aria-labelledby="contact-title">
        <div class="lot-container lot-contact__inner"><div><p class="lot-kicker lot-kicker--light">Связаться напрямую</p><h2 id="contact-title">Большой проект начинается<br><em>с правильной территории.</em></h2><p>Получите материалы по составу объекта, задайте вопросы собственнику и договоритесь о просмотре массива.</p><p class="lot-contact__reassurance">Вы сами выбираете удобный способ связи: звонок или сообщение в мессенджере. Сайт не собирает и не хранит ваши персональные данные.</p></div><div class="lot-contact__actions"><a class="lot-button lot-button--accent" href="${viewingContact}" target="_blank" rel="noreferrer" data-contact-channel="whatsapp" data-event="viewing_request">Написать Екатерине ${arrow}</a><a class="lot-button lot-button--outline" href="${phoneHref}" data-contact-channel="phone" data-event="phone_click">Позвонить ${contacts.phone} ${arrow}</a><a class="lot-button lot-button--outline" href="${whatsapp}" target="_blank" rel="noreferrer" data-contact-channel="whatsapp" data-event="messenger_click">WhatsApp ${arrow}</a><a class="lot-button lot-button--outline" href="${telegram}" target="_blank" rel="noreferrer" data-contact-channel="telegram" data-event="messenger_click">Telegram ${arrow}</a></div></div>
    </section>
  </main>

  <footer class="lot-footer"><div class="lot-container"><div><a class="lot-brand" href="#top"><span>НБ</span><b>Новое<br>Бородино</b></a><p>Земельный актив 6,2 га<br>в Можайском районе.</p></div><div><span>Связаться</span><strong>Екатерина Хабарова</strong><a href="${phoneHref}">${contacts.phone}</a></div><div><span>Информация</span><a href="#territory">Территория</a><a href="#location">Локация</a><a href="/cookie-i-analitika/">Cookie и аналитика</a></div></div><div class="lot-container lot-footer__bottom"><span>© 2026 Новое Бородино</span><button type="button" data-cookie-settings>Настроить cookie</button></div></footer>
  <dialog class="lot-lightbox" data-lightbox-dialog aria-label="Просмотр изображения"><button type="button" aria-label="Закрыть просмотр" data-lightbox-close>×</button><figure><img src="" alt="" data-lightbox-image><figcaption data-lightbox-caption></figcaption></figure></dialog>
`;
