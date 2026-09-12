import { chapters } from './data/chapters.js';

export const investorHero = `
<section class="lot-hero" id="top" aria-labelledby="page-title">
  <img src="/images/hero-vivid.webp" alt="Земельный массив Новое Бородино с высоты" width="1280" height="960" fetchpriority="high">
  <div class="lot-hero__shade"></div><div class="lot-container lot-hero__content">
    <p class="lot-kicker">Земельный актив · Можайский район</p>
    <h1 id="page-title"><span class="lot-hero__title-accent">Большой проект<br>не собирают</span><em>из маленьких решений</em></h1>
    <p class="lot-hero__lead">Земельный массив 6,2 га в Новом Бородино: 71 размежёванный участок и 1 га внутренних дорог продаются единым лотом от собственника.</p>
    <div class="lot-hero__offer"><strong>55 млн ₽</strong><span>единый лот<br>105 км от МКАД · 30 км до Можайска</span></div>
    <div class="lot-actions"><button class="lot-button lot-button--accent" type="button" data-contact-choice-open data-contact-context="hero" data-event="presentation_request">Наши контакты ↗</button><a class="lot-text-link lot-text-link--light" href="#asset">Понять состав лота ↓</a></div>
    <p class="lot-hero__cta-note">Материалы предоставляет отдел продаж. Выберите удобный способ связи.</p>
  </div><div class="lot-hero__bottom lot-container"><span>Предложение для девелопера и инвестора</span><a href="#asset">Состав предложения ↓</a></div>
</section>`;

export const diligence = `
<section class="lot-section lot-section--ink functional" id="facts" aria-labelledby="facts-title"><div class="lot-container">
  <div class="lot-heading"><div><p class="lot-kicker">${chapters.facts}</p><h2 id="facts-title">Документы собраны.<br>Ключевые согласования получены.</h2></div><p>По объекту подготовлен комплект подтверждающих материалов: реестр 71 участка, актуальные выписки, документы на внутренние дороги, сведения об электроснабжении, согласования Минкультуры и материалы археологических работ.</p></div>
  <div class="fact-status" role="list">
    <article role="listitem"><span>Сформировано</span><h3>71 участок · 5,2 га</h3><p>Территория размежёвана. Реестр кадастровых номеров и площадей подготовлен.</p></article>
    <article role="listitem"><span>В собственности</span><h3>Внутренние дороги · 1 га</h3><p>Дорожные участки размежёваны, входят в единый лот и передаются вместе с массивом. На территории выполнено твёрдое грунтовое основание.</p></article>
    <article role="listitem"><span>Подтверждено</span><h3>Категория и ВРИ</h3><p>Земли сельскохозяйственного назначения, зона СХ-2, ВРИ 13.2 «Ведение садоводства».</p></article>
    <article role="listitem"><span>Получено</span><h3>Минкультура</h3><p>Необходимые согласования Минкультуры получены. Подтверждающие документы входят в пакет материалов.</p></article>
    <article role="listitem"><span>Завершено</span><h3>Археология</h3><p>Археологическое шурфование завершено. Итоговые материалы готовы к ознакомлению.</p></article>
    <article role="listitem"><span>Подтверждено</span><h3>Права на объект</h3><p>Права на участки и внутренние дороги подтверждены актуальными документами и выписками.</p></article>
    <article role="listitem"><span>Электросети заведены</span><h3>Электроснабжение</h3><p>Электросети заведены на территорию и переданы на баланс Россетей для обслуживания.</p></article>
    <article role="listitem"><span>Следующий этап проекта</span><h3>Водоснабжение и водоотведение</h3><p>Схему водоснабжения и водоотведения будущий девелопер определяет самостоятельно в рамках проектирования посёлка.</p></article>
  </div>
</div></section>`;
