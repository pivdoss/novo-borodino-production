// No counter, request or analytics storage until a real ID and consent exist.
const counter = Number(import.meta.env.VITE_METRIKA_ID || 0);
const enabled = Number.isInteger(counter) && counter > 0;
const key = 'novo-borodino-analytics-consent';
const version = '2026-09-08';
let choice, loaded = false;
const goals = new Set(['hero_view','section_view','scroll_depth','contact_click','phone_click','presentation_request','materials_request','viewing_request','masterplan_open','gallery_open','route_click','map_open']);
['click_phone_call','lead_telegram_click','lead_whatsapp_click','lead_hero_memo','lead_due_diligence','lead_cadastre_registry','lead_fin_model','lead_site_visit','route_open'].forEach(goal=>goals.add(goal));
const read = () => { try { const value=JSON.parse(localStorage.getItem(key));return value?.version===version?value.choice:null; } catch {return null;} };
const save = value => { choice=value;try {localStorage.setItem(key,JSON.stringify({version,choice}));} catch {/* Choice remains in memory when browser storage is unavailable. */} };
export const reachMetrikaGoal = (goal, params={}) => {
  if (!enabled || choice!=='accepted' || !goals.has(goal) || !window.ym) return;
  const safe={};
  for(const field of ['channel','section','depth']) if (/^[a-z0-9_-]{1,32}$/i.test(String(params[field]||''))) safe[field]=params[field];
  window.ym(counter,'reachGoal',goal,safe);
};
const start = () => {
  if(loaded)return;loaded=true;
  window.ym=window.ym||function(...args){(window.ym.a=window.ym.a||[]).push(args);};window.ym.l=Date.now();
  const script=document.createElement('script');script.async=true;script.src='https://mc.yandex.ru/metrika/tag.js';
  script.onload=()=>{
    if(choice!=='accepted')return;
    // Only campaign codes, never message text, contact URLs or arbitrary queries.
    const url=new URL(location.origin+location.pathname), query=new URLSearchParams(location.search);
    for(const field of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term']) {
      const value=query.get(field);if(value && /^(?:[a-z][a-z0-9_-]{0,79}|[0-9]{1,9})$/i.test(value))url.searchParams.set(field,value);
    }
    window.ym(counter,'init',{defer:true,clickmap:false,trackLinks:false,webvisor:false,accurateTrackBounce:true});
    window.ym(counter,'hit',url.href,{referer:document.referrer?new URL(document.referrer).origin:''});
    const seen=new Set();
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting&&!seen.has(entry.target.id)){seen.add(entry.target.id);reachMetrikaGoal(entry.target.id==='top'?'hero_view':'section_view',{section:entry.target.id});}
    }),{threshold:.15});
    document.querySelectorAll('main section[id]').forEach(el=>observer.observe(el));
    let max=0,scheduled=false;
    window.addEventListener('scroll',()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{
      scheduled=false;const depth=Math.floor((scrollY+innerHeight)/document.documentElement.scrollHeight*4)*25;
      if(depth>max){max=depth;reachMetrikaGoal('scroll_depth',{depth:Math.min(100,depth)});}
    });},{passive:true});
  };
  document.head.append(script);
};
export const initAnalyticsConsent = () => {
  if(!enabled)return;
  choice=read();
  document.querySelectorAll('[data-cookie-settings]').forEach(el=>el.hidden=false);
  document.body.insertAdjacentHTML('beforeend','<section class="cookie-banner" data-cookie-banner role="region" aria-label="Настройки аналитики" hidden><p><strong>Аналитика — по вашему выбору</strong><span>Яндекс Метрика помогает понять, какие разделы полезны посетителям. <a href="/cookie-i-analitika/">Подробнее</a></span></p><div class="cookie-banner__actions"><button type="button" data-cookie-choice="accepted">Разрешить</button><button type="button" data-cookie-choice="rejected">Без аналитики</button></div></section>');
  const banner=document.querySelector('[data-cookie-banner]');
  let returnFocus;
  const change=()=>document.dispatchEvent(new Event('analytics-consent-change'));
  if(choice==='accepted')start();else if(choice!=='rejected')banner.hidden=false;
  document.addEventListener('click',event=>{
    const settings=event.target.closest('[data-cookie-settings]');
    if(settings){returnFocus=settings;banner.hidden=false;banner.querySelector('button').focus();change();}
    const button=event.target.closest('[data-cookie-choice]');if(!button)return;
    save(button.dataset.cookieChoice);banner.hidden=true;
    if(choice==='accepted')start();else if(loaded){window.ym?.(counter,'destruct');loaded=false;}
    returnFocus?.focus();change();
  });change();
};
